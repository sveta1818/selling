
const itemsForm = document.getElementById('addItem');
itemsForm.addEventListener('submit', handleFormSubmit);
let itemList = JSON.parse(localStorage.getItem('itemList')) || [];
let selectedPhotos = [];
let editingId = null;
//for swipes:
let modalImages = [];
let currentIndex = 0;
let startX = 0;

const openForm = document.getElementById('addItemBtn');

const itemName = document.getElementById('name');
const itemOrderdDate = document.getElementById('order-date');
const itemDelDate = document.getElementById('date-received');
const itemShipDate = document.getElementById('shipping-date');
const additionalInfo = document.getElementById('additional-com');
const imageModal =document.getElementById('imageModal');
const modalImage = document.getElementById('modalImg');
const closeImgBtn = document.querySelector('span');


const photoPreview = document.getElementById('photoPreview');
const photoInput = document.getElementById('photo');
function renderPhotoPreview(){
photoPreview.innerHTML = '';
selectedPhotos.forEach((src, index) =>{
    const img = document.createElement('img');
    img.src = src;
    img.alt = `Photo ${index + 1}`;
    img.className = 'previewItem';
    photoPreview.appendChild(img);

})
}
photoInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);

  files.forEach(file => {
    const reader = new FileReader();

    reader.onload = () => {
      selectedPhotos.push(reader.result);
      renderPhotoPreview();
    };

    reader.readAsDataURL(file);
  });

//   photoInput.value = '';
});



//local storige saving

// what happen if form will be submited
function handleFormSubmit(event){
    event.preventDefault();
    const form = event.target;

    const itemName = event.target.elements['name'].value;
    const itemOrderdDate = event.target.elements['order_date'].value;
    const itemDelDate = event.target.elements['date_received'].value;
    const itemShipDate = event.target.elements['shipping_date'].value;
    const additionalInfo = event.target.elements['additional_com'].value;
    const photoInput = [...selectedPhotos];
    if(editingId !== null){
        const item = itemList.find(el=>el.id === editingId);
        if(!item) return;

        item.name = itemName;
        item.orderDate = itemOrderdDate;
        item.deliveryDate = itemDelDate;
        item.shipedDate = itemShipDate;
        item.additional = additionalInfo;
        item.pic = photoInput;

        const oldCard = document.querySelector(`.card[data-id="${editingId}"]`);
        oldCard.replaceWith(createCard(
          item.id,
          item.name,
          item.orderDate,
          item.deliveryDate,
          item.shipedDate,
          item.additional,
          item.pic
        )
    );
    editingId = null;
    } else{
 
    //for local storage(create and add):
    const newItemCard = {
        id: Date.now(),//unic id for each item
        name:itemName,
        orderDate:itemOrderdDate,
        deliveryDate:itemDelDate,
        shipedDate:itemShipDate,
        additional:additionalInfo,
        pic: photoInput
       
    };
    itemList.push(newItemCard);
document.getElementById('addedItemContainer').appendChild(createCard(newItemCard.id, newItemCard.name,
     newItemCard.orderDate, newItemCard.deliveryDate, newItemCard.shipedDate, newItemCard.additional,
     newItemCard.pic));
}


try {
  localStorage.setItem('itemList', JSON.stringify(itemList));

  event.target.reset();
  selectedPhotos = [];
  renderPhotoPreview();
} catch (e) {
  alert('Too many images. Storage limit exceeded.');
  console.error(e);
}

    // localStorage.setItem('itemList', JSON.stringify(itemList));
   
    //  event.target.reset();
    //  selectedPhotos=[];
    //  renderPhotoPreview();
    }
// add function createCard
function createCard(itemId, itemName, itemOrderdDate, itemDelDate, itemShipDate, additionalInfo, downloadPIc){
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = itemId;

    const contNameBtn = document.createElement('div');
    contNameBtn.className = 'nameBtn';
    card.appendChild(contNameBtn);
   
    const itemNameTag = document.createElement('h4');
    itemNameTag.innerHTML = itemName;
    contNameBtn.appendChild(itemNameTag);
    itemNameTag.addEventListener('click',()=>{
        card.classList.toggle('open');
    })


    const conteinerForBtn = document.createElement('div');
conteinerForBtn.className = 'contBtn';
contNameBtn.appendChild(conteinerForBtn);

const cardDeleteBtn = document.createElement('button');
cardDeleteBtn.className = 'removeCard';
cardDeleteBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"
     xmlns="http://www.w3.org/2000/svg">
  <path d="M3 6H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <path d="M8 6V4H16V6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <path d="M19 6L18 20H6L5 6"
        stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <path d="M10 11V17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <path d="M14 11V17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>`
;
cardDeleteBtn.setAttribute('aria-label', 'Delete card');
cardDeleteBtn.addEventListener('click', removeCard);
conteinerForBtn.appendChild(cardDeleteBtn);


    
const cardEditButton = document.createElement('button');
cardEditButton.className = 'editCard';
cardEditButton.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24"
     fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25Z"
        stroke="currentColor" stroke-width="2"
        stroke-linejoin="round"/>
  <path d="M14.06 6.19L17.81 9.94"
        stroke="currentColor" stroke-width="2"
        stroke-linecap="round"/>
</svg>`;
cardEditButton.setAttribute('aria-label', 'Edit');
cardEditButton.addEventListener('click', editCard);
conteinerForBtn.appendChild(cardEditButton);

const cardContent = document.createElement('div');
cardContent.className ='cardContent';
card.appendChild(cardContent);

const itemOrder = document.createElement('p');
itemOrder.innerHTML = `Order date: ${itemOrderdDate}`;
cardContent.appendChild(itemOrder);

    const itemDelivery = document.createElement('p');
    itemDelivery.innerHTML = `Delivery date: ${itemDelDate}`;
    cardContent.appendChild(itemDelivery);

    const itemShipping = document.createElement('p');
    itemShipping.innerHTML =`Shipped date: ${itemShipDate}`;
    cardContent.appendChild(itemShipping);
  
    if(additionalInfo.length !==0){
        const addInfo = document.createElement('p');
    addInfo.className = 'additionalText';
    addInfo.innerHTML = additionalInfo;
    cardContent.appendChild(addInfo);
    }

  if(downloadPIc && downloadPIc.length){
   const contForPic = document.createElement('div');
   contForPic.className = 'picContainer';
   downloadPIc.forEach((src, index) => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = `Photo ${index + 1}`;
    img.className = 'cardPhoto';

    img.addEventListener('click', () => {
    modalImages = [...img.parentElement.querySelectorAll('.cardPhoto')]
        .map(photo => photo.src);

    currentIndex = modalImages.indexOf(img.src);

    modalImage.src = modalImages[currentIndex];
    imageModal.classList.remove('hidden');
});
   

//     img.addEventListener('click', (e)=>{
//         e.stopPropagation();
//     imageModal.classList.remove('hidden');
//     modalImage.src = img.src;
// })
    contForPic.appendChild(img);
   });
   cardContent.appendChild(contForPic);
}
    
return card;
}
function clearForm() {
        itemsForm.reset();
        selectedPhotos = [];
        photoPreview.innerHTML ='';
    }
function removeCard(event){
    const button = event.currentTarget;
const card = button.closest('.card');
const id = Number(card.dataset.id);
itemList = itemList.filter(item => item.id !== id);
// localStorage.setItem('itemList', JSON.stringify(itemList));
// card.remove();

try {
  localStorage.setItem('itemList', JSON.stringify(itemList));
  card.remove();
} catch (e) {
  console.error('Storage error on delete', e);
}

if(editingId === id){
    clearForm();
    editingId = null;
}
console.log('target:', event.target);
console.log('card:', event.target.closest('.card'));
console.log('id:', Number(event.target.closest('.card')?.dataset.id));
}
function editCard(event){
const card = event.target.closest('.card');
editingId = Number(card.dataset.id);
const nameCard = itemList.find(item => item.id === editingId);
if(!nameCard) return;
document.getElementById('name').value = nameCard.name;
document.getElementById('order-date').value = nameCard.orderDate;
document.getElementById('date-received').value = nameCard.deliveryDate;
document.getElementById('shipping-date').value = nameCard.shipedDate;
document.getElementById('additional-com').value = nameCard.additional;
selectedPhotos =[...nameCard.pic];renderPhotoPreview();
}


closeImgBtn.addEventListener('click', ()=>{
    imageModal.classList.add('hidden');
    modalImage.src = '';
})

//for swipes:
imageModal.addEventListener('touchstart', (e) =>{
    startX = e.touches[0].clientX;
})
imageModal.addEventListener('touchstart', (e) =>{
    startX = e.changedTouches[0].clientX;
    const diffX = startX - endX;
    if(Math.abs(diffX) > 50){
        if(diffX>0){
            showNextImage();
        }else{
            showPrewImage();
        }
    }
})
function showNextImage(){
    currentIndex = (currentIndex + 1) % modalImages.length;
    modalImage.src = modalImages[currentIndex];
}
function showPrewImage(){
    currentIndex = (currentIndex - 1 + modalImages.length) % modalImages.length;
    modalImage.src = modalImages[currentIndex];
}
window.addEventListener('DOMContentLoaded', () => {
    const saveNotes = JSON.parse (localStorage.getItem('itemList')) || [];
    itemList = saveNotes;
    const container = document.getElementById('addedItemContainer');
    itemList.forEach(item => {
        container.appendChild(createCard(item.id, item.name,
            item.orderDate, item.deliveryDate, item.shipedDate, 
            item.additional, item.pic));
        // document.getElementById('addedItemContainer').appendChild(itemCard);
    })
    
})
