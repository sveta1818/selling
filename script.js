let db;
let itemList = [];
function openDB(){
    return new Promise((resolve, reject)=>{
        const request = indexedDB.open('itemsDB', 1);
        request.onupgradeneeded = (event) => {
            db = event.target.result;
            if(!db.objectStoreNames.contains ('itemList')) {
                db.createObjectStore('itemList', 
                {keyPath: 'id'})
            }
         };
         request.onsuccess = (event) =>{
            db = event.target.result;
            resolve();
            console.log("Database opened successfully");
         }
        request.onerror = () => reject('indexedDB error');
        console.log("Database failed to open")
    })
}
const itemsForm = document.getElementById('addItem');
itemsForm.addEventListener('submit', handleFormSubmit);
document.addEventListener('DOMContentLoaded',async()=>{
    await openDB();
    loadItemsFromDB();
})
function loadItemsFromDB(){
    const tx = db.transaction('itemList', 'readonly');
    const store = tx.objectStore('itemList');
    const request = store.getAll();

    request.onsuccess = ()=>{
        itemList = request.result || [];
        console.log('loaded from DB:', itemList);
        itemList.forEach(item =>{
            document.getElementById('addedItemContainer')
            .appendChild(createCard(item.id, item.name,
            item.orderDate, item.orderPrice, item.deliveryDate, item.shipedDate,item.soldPrice, 
            item.additional, item.pic));
        });
    };
}
let selectedPhotos = [];
let editingId = null;
//for swipes:
let modalImages = [];
let currentIndex = 0;
let startX = 0;
let endX = 0;

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
const photoCamera = document.getElementById('photoCamera');
const btnCamera = document.getElementById('btnCamera');
const btnGallery = document.getElementById('btnGallery');

function renderPhotoPreview(){
photoPreview.innerHTML = '';
selectedPhotos.forEach((src, index) =>{
    const wrapper = document.createElement('div');
    wrapper.className = 'previewWrapper';
    const img = document.createElement('img');
    img.src = src;
    img.alt = `Photo ${index + 1}`;
    img.className = 'previewItem';
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'removePhotoBtn';
    removeBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none"
     xmlns="http://www.w3.org/2000/svg">
  <path d="M6 6L18 18" stroke="white" stroke-width="2" stroke-linecap="round"/>
  <path d="M6 18L18 6" stroke="white" stroke-width="2" stroke-linecap="round"/>
</svg>`

removeBtn.addEventListener('click', ()=>{
    selectedPhotos.splice(index, 1);
    renderPhotoPreview();
})
    wrapper.appendChild(img);
    wrapper.appendChild(removeBtn)
    photoPreview.appendChild(wrapper);

})
}
//compress img:
function compressImage(file, maxWidth = 1024, quality = 0.7) {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();
      img.src = reader.result;

      img.onload = () => {
        let { width, height } = img;

        // proportions are the same:
        if (width > maxWidth) {
          height = height * (maxWidth / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
    };

    reader.readAsDataURL(file);
  });
}
async function handlePhotos(e) {
    const files = [...e.target.files];
    for(const file of files){
        const compressing = await compressImage(file);
        selectedPhotos.push(compressing);
        renderPhotoPreview();
    }
    e.target.value = '';
}
photoInput.addEventListener('change', handlePhotos);
photoCamera.addEventListener('change', handlePhotos);
btnCamera.onclick = () => photoCamera.click();
btnGallery.onclick = () => photo.click();

// what happen if form will be submited
function handleFormSubmit(event){
    event.preventDefault();
    const form = event.target;

    const itemName = event.target.elements['name'].value;
    const itemOrderdDate = event.target.elements['order_date'].value;
    const itemOrderPrice = event.target.elements['purch_price'].value;
    const itemDelDate = event.target.elements['date_received'].value;
    const itemShipDate = event.target.elements['shipping_date'].value;
    const itemSoldPrice = event.target.elements['sale_price'].value;
    const additionalInfo = event.target.elements['additional_com'].value;
    const photos = [...selectedPhotos];
    if(editingId !== null){
        const item = itemList.find(el=>el.id === editingId);
        if(!item) return;

        item.name = itemName;
        item.orderDate = itemOrderdDate;
        item.orderPrice = itemOrderPrice;
        item.deliveryDate = itemDelDate;
        item.shipedDate = itemShipDate;
        item.soldPrice = itemSoldPrice;
        item.additional = additionalInfo;
        item.pic = photos;

        const oldCard = document.querySelector(`.card[data-id="${editingId}"]`);
        oldCard.replaceWith(createCard(
          item.id,
          item.name,
          item.orderDate,
          item.orderPrice,
          item.deliveryDate,
          item.shipedDate,
          item.soldPrice,
          item.additional,
          item.pic
        )
    );
    editingId = null;
    clearForm();
    return;
    } else{
 
    //for local storage(create and add):
    const newItemCard = {
        id: Date.now(),//unic id for each item
        name:itemName,
        orderDate:itemOrderdDate,
        orderPrice:itemOrderPrice,
        deliveryDate:itemDelDate,
        shipedDate:itemShipDate,
        soldPrice:itemSoldPrice,
        additional:additionalInfo,
        pic: photos
       
    };
    itemList.push(newItemCard);
    saveItemToDB(newItemCard);
document.getElementById('addedItemContainer').appendChild(createCard(newItemCard.id, newItemCard.name,
     newItemCard.orderDate, newItemCard.orderPrice, newItemCard.deliveryDate, newItemCard.shipedDate,
     newItemCard.soldPrice, newItemCard.additional,
     newItemCard.pic));
     clearForm();
     function saveItemToDB(item){
        const tx = db.transaction('itemList', 'readwrite');
    const store = tx.objectStore('itemList');
    store.put(item);
     }

}
}
// add function createCard
function createCard(itemId, itemName, itemOrderdDate, itemOrderPrice,
     itemDelDate, itemShipDate, itemSoldPrice, additionalInfo, downloadPIc){
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = itemId;
    const contNameBtn = document.createElement('div');
    contNameBtn.className = 'nameBtn';
    card.appendChild(contNameBtn);
   
    const itemNameTag = document.createElement('h4');
    itemNameTag.innerHTML = itemName;
    if(itemShipDate){
        itemNameTag.classList.add('sold');
    }
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

const itemBoughtWith = document.createElement('div');
itemBoughtWith.className = 'itemBougtWith';
cardContent.appendChild(itemBoughtWith);

const itemOrder = document.createElement('p');
itemOrder.innerHTML = `Order date: ${itemOrderdDate}`;
itemBoughtWith.appendChild(itemOrder);

if (itemOrderPrice !== undefined && itemOrderPrice !== null) {
  const p = document.createElement('p');
  p.textContent = `Purchase price: $${itemOrderPrice}`;
  itemBoughtWith.appendChild(p);
}

const itemDelivery = document.createElement('p');
itemDelivery.innerHTML = `Delivery date: ${itemDelDate}`;
cardContent.appendChild(itemDelivery);

const itemSoldWith = document.createElement('div');
itemSoldWith.className = 'itemSoldWhith';
cardContent.appendChild(itemSoldWith);

const itemShipping = document.createElement('p');
itemShipping.innerHTML =`Shipped date: ${itemShipDate}`;
itemSoldWith.appendChild(itemShipping);

if (itemSoldPrice !== undefined && itemSoldPrice !== null) {
  const p = document.createElement('p');
  p.textContent = `Sale price: $${itemSoldPrice}`;
  itemSoldWith.appendChild(p);
}
  
    if(additionalInfo && additionalInfo.length !==0){
        const addInfo = document.createElement('p');
    addInfo.className = 'additionalText';
    addInfo.innerHTML = additionalInfo;
    cardContent.appendChild(addInfo);
    }

    const order  = Number(itemOrderPrice);
    const sale = Number(itemSoldPrice);
    if(!isNaN(order) && !isNaN(sale)){
        const profit = (sale - order).toFixed(2);
        const p = document.createElement('p');
        p.classList.add(profit>=0 ? 'profit-plus' : 'profit-minus')
        p.textContent = `Profit: $${profit}`;
        cardContent.appendChild(p);
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
deliteItemFromDB(id);
card.remove();
function deliteItemFromDB(id){
     const tx = db.transaction('itemList', 'readwrite');
    const store = tx.objectStore('itemList');
    store.delete(id);
    tx.oncomplete = () =>{
        console.log('deleted from DB: ', id)
    }
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
selectedPhotos =nameCard.pic ? [...nameCard.pic]: [];renderPhotoPreview();
}


closeImgBtn.addEventListener('click', ()=>{
    imageModal.classList.add('hidden');
    modalImage.src = '';
})

//for swipes:
imageModal.addEventListener('touchstart', (e) =>{
    startX = e.touches[0].clientX;
})
imageModal.addEventListener('touchend', (e) =>{
    endX = e.changedTouches[0].clientX;
    const diffX = startX - endX;
    if(Math.abs(diffX) > 50){
        if(diffX>0){
            showNextImage();
        }else{
            showPrewImage();
        }
    }
})
imageModal.addEventListener('click', ()=>{
    showNextImage();
})
function showNextImage(){
    currentIndex = (currentIndex + 1) % modalImages.length;
    modalImage.src = modalImages[currentIndex];
}
function showPrewImage(){
    currentIndex = (currentIndex - 1 + modalImages.length) % modalImages.length;
    modalImage.src = modalImages[currentIndex];
}

if('serviceWorker' in navigator){
    navigator.serviceWorker.register('./sw.js')
    .then(()=> console.log('SW registered'))
    .catch(err => console.log('SW error', err));
}

