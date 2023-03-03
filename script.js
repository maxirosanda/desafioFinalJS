import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js"
import { 
  getFirestore,
  collection,
  getDocs,
  getDoc,
  addDoc,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js"
import { 
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
  deleteObject
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-storage.js"
import { 
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js"

const firebaseConfig = {
  apiKey: "AIzaSyD0Wt3WigWLaxGVXBz6xGVLiUmVYC3ZQmA",
  authDomain: "curso-coder-js.firebaseapp.com",
  projectId: "curso-coder-js",
  storageBucket: "curso-coder-js.appspot.com",
  messagingSenderId: "613075399060",
  appId: "1:613075399060:web:4cb43ed84386bd28fc1f81"
}
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const storage = getStorage()
const auth = getAuth(app)
const id = window.location.href.split("#")[1]

const showMessage = (message, type = "success") => {
  Toastify({
    text: message,
    duration: 3000,
    destination: "https://github.com/apvarun/toastify-js",
    newWindow: true,
    close: true,
    gravity: "bottom",
    position: "right", 
    stopOnFocus: true, 
    style: {
      background: type === "success" ? "green" : "red",
    },
  }).showToast();
}  
const showAlert = (title,text, type = "success") => {
  Swal.fire({
    title: title,
    text: text,
    icon: type,
    confirmButtonText: 'Continuar'
  })
}
const signUp = () => {
  const signUp = document.getElementById("signUp")
  signUp.addEventListener("submit", async(e)=>{
    e.preventDefault()
    const email = signUp["signUpEmail"].value
    const password = signUp["signUpPassword"].value
    try{
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      const signupModal = document.querySelector("#signupModal");
      const modal = bootstrap.Modal.getInstance(signupModal.closest('.modal'));
      modal.hide();
      signUp.reset()
      document.location = './crear.html#productos'
      showMessage("Bienvenido " + user.email);
    }catch(e){

      switch(e.code){
        case 'auth/email-already-in-use' :
          showMessage("Email ya fue usado", "error")
          break
        case 'auth/invalid-email':
          showMessage("Email invalido", "error")
          break
        case 'auth/weak-password':
          showMessage("Password debil", "error")
          break
        default:
          showMessage("Algo salió mal", "error")
      }
    }
  


  })

}

const signIn = (e) => {
  const signIn =document.getElementById("signIn")
  signIn.addEventListener("submit", async(e)=>{
    e.preventDefault()
    const email = signIn["signInEmail"].value
    const password = signIn["signInPassword"].value
    try{
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      const signinModal = document.querySelector("#signinModal")
      const modal = bootstrap.Modal.getInstance(signinModal.closest('.modal'))
      modal.hide()
      signIn.reset()
      document.location = './crear.html#productos'
      showMessage("Hola " + user.email)
    }catch(e){
      switch(e.code){
        case 'auth/wrong-password':
          showMessage("Password incorrecto", "error")
          break
        case 'auth/user-not-found':
          showMessage("Usuario no encontrado", "error")
          break
        default:
          showMessage("Algo salió mal", "error")
      }
    }


  })

}

const logOut = () => {
  const logOut = document.getElementById("signOut")
  logOut.addEventListener("click",async () => {
    try{
      await signOut(auth)
      showMessage("Chau")
      setTimeout(()=>{
        document.location = './index.html'
      },1000)
    
    }catch(e){
      showMessage("Algo salió mal", "error")
    }
 })
}

const inputs = (datos)=>{
  const inputs = {}
  for(let i = 0 ; i < datos.length - 1 ; i++){
    if(datos[i].type != "file"){
      inputs[datos[i].name] = datos[i].value
    }  
    
  }
  return inputs
}

const productView = (product) =>{
  const div = document.createElement("div")
  div.innerHTML = `
    <div class="card" style="width: 18rem;">
      <img src="${product.imgURL}" class="card-img-top" alt="...">
      <div class="card-body">
        <h5 class="card-title">${product.name}</h5>
        <p class="card-text">${product.desc}</p>
        <div class="d-flex justify-content-around">
          <p class="card-text"><b>Stock:</b> ${product.stock}</p>
          <p class="card-text"><b>Precio:</b> ${product.price}$</p>
        </div>
        <a type="button" class="btn btn-primary" href=./editar.html#${product.id}>Editar</a>
      </div>
    </div>`
  list.append(div)
}

const productsView = async () => {
  try {
    const products = await getDocs(collection(db,"products"))
    products.forEach((element) =>{
      const product = element.data()
      product.id = element.id
      productView(product) 
     })
  } catch (e) {
    showAlert('Error!','No se pudo cargar los productos','error')
  }
}   
const editView = (product ,id)=>{
  const div = document.getElementById("product")
  div.innerHTML = `
    <form id="update-${id}" class="form">
      <img src="${product.imgURL}" class="img">
      <input type="text" class="form-control" minlength="15" maxlength="66" name="name" value="${product.name}" required>
      <textarea name="desc" class="form-control" minlength="100" maxlength="221"  required>${product.desc}</textarea>
      <div>
        <input type="number" class="form-control"  name="price" value=${product.price} required>
        <input type="number" class="form-control"  name="stock" value=${product.stock} min="1" max="100" required>
      </div>
      <input type="file" name="image" class="form-control"  >
      <button class="btn btn-primary mb-3" type="submit">Actualizar</button>
    </form>
    <form id="delete-${id}"  class="form">
      <button class="btn btn-primary" type="submit">Borrar</button>
    </form>
  `
}
const productCreate = () => {
  const create = document.getElementById("create")
  create.addEventListener("submit", async e => {
    e.preventDefault()
    const product =inputs(create.elements)
    try {
      const productDb = await addDoc(collection(db, "products"),product)
      product.id = productDb.id
      const storageRef = ref(storage,`product-${product.id}`)
      await uploadBytes(storageRef, e.target[4].files[0])
      product.imgURL =  await getDownloadURL(storageRef)
      await updateDoc(doc(db, "products",product.id),product)
      productView(product)
      showMessage("Se a agregado un producto")
      create.reset()
    } catch (e) {
      showAlert('Error!','No se guardo el producto',"error")
    } 
  })
}
const productUpdate = id => {
  const update = document.getElementById(`update-${id}`)
  update.addEventListener("submit", async e =>{
    e.preventDefault()
    const product = inputs(update.elements)
    try {
      const storageRef = ref(storage,`product-${id}`)
      e.target[4].files[0] && await uploadBytes(storageRef, e.target[4].files[0])
      await updateDoc(doc(db, "products",id),product)
      showMessage("Se a actualizado un producto")
      setTimeout(()=>{
        document.location = './crear.html#productos'
      },2000)
    } catch (e) {
      showAlert('Error!','No se pudo actualizar el producto',"error")
    }
  })
}

const productDelete = (id) => {
  const productDelete = document.getElementById(`delete-${id}`)
  productDelete.addEventListener("submit", async e => {
    e.preventDefault()
    try {
      await deleteDoc(doc(db, "products", id))
      await deleteObject(ref(storage,`product-${id}`))
      showMessage("Se aliminado un producto")
      setTimeout(()=>{
        document.location = './crear.html#productos'
      },2000)   
    } catch (e) {
      showAlert('Error!','No se pudo eliminar el producto',"error")
    }
  })
}
const productEdit = async id => {
  try {
    let product = await getDoc(doc(db,"products",id))
    product = product.data()
    editView(product,id)
    productUpdate(id)
    productDelete(id)
  } catch (e) {
    showAlert('Error!','No se pudo cargar los productos',"error")
  }
}
signIn()
logOut()
signUp()
onAuthStateChanged(auth, async (user) => {
  if (user) {
    if(id == "productos"){
      productsView()
      productCreate()
      console.log(id)
    }else if (id){
      productEdit(id)
      console.log("fgg")
    }
  }
})




