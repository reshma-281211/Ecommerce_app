var express = require('express');
var router = express.Router();
const productHelpers=require('../helpers/product-helpers');
var db = require('../config/connection');
var collection=require('../config/collection');
const userHelpers=require('../helpers/user-helpers');
const verifyLogin=(req,res,next)=>{
if(req.session.loggedIn)
{
  next()
}
else
{
  res.redirect('/login')
}
}
/* GET home page. */

router.get('/', async function(req, res, next) {
  let user=req.session.user
  console.log(user);
  let cartCount=null
  if(req.session.user)
  {
  cartCount= await userHelpers.getCartCount(req.session.user._id)
  }
  
  productHelpers.getAllProducts().then((products)=>{
     //console.log(products)
     res.render('users/users-view-products', {products,user, cartCount})
   })  
});


router.get('/login', (req, res)=>{
  if(req.session.loggedIn)
  {
    res.redirect('/')
  }
  else
  {
   
    res.render('users/login',{loginErr:req.session.loginErr})
    req.session.loginErr=false;
  
  }
});
  
 


router.get('/signup', (req,res)=>{
  res.render('users/signup')
 
});

router.post('/signup', (req,res)=>{

   userHelpers.doSignup(req.body). then ((result)=>
   {
     req.session.loggedIn=true
     req.session.user=result
    res.redirect('/login');
    
   })

})

router.post('/login', (req,res)=>{
userHelpers.doLogin(req.body).then((response)=>{
  if(response.status)
  {
    req.session.loggedIn=true
    req.session.loginStatus="Valid user"
    req.session.user=response.user
    res.redirect('/')

  }
  else{
    req.session.loginErr="Invalid Username or password"
    res.redirect('/login')

  }
})
})

router.get('/logout',(req,res)=>{
req.session.destroy()
res.redirect('/signup')
})

router.get('/cart', verifyLogin,async(req,res)=>{
  let products=await userHelpers.getCartProducts(req.session.user._id)
  let total=await userHelpers.getTotalAmount(req.session.user._id)
  if (products) {
    products.forEach(p => {
      p.isQuantityOne = p.quantity === 1;
    });
  }
  let cartCount=await userHelpers.getCartCount(req.session.user._id);
  console.log(products);
  res.render('users/cart',{products,user:req.session.user,cartCount,total})
})



router.get('/add-to-cart/:id',(req,res)=>{
  console.log("api call");
  userHelpers.addToCart(req.params.id, req.session.user._id).then(()=>
{
   res.json({status:true})
  
  
  //res.redirect('/')
})
 


})
router.post('/change-product-quantity',(req,res, next)=>{
userHelpers.changeProductQuantity(req.body). then((response)=>{

  res.json({status:true})
  
})

})


router.post('/remove-from-cart', (req, res, next) => {
  userHelpers.removeFromCart(req.body).then((response) => {
    res.json(response);
  })
})

router.get('/place-order', verifyLogin,async(req, res) => {
   
  let total=await userHelpers.getTotalAmount(req.session.user._id)
  let grandTotal=total +50
  res.render('users/place-order',{total,grandTotal,user:req.session.user})
})


router.post('/place-order',async(req,res)=>{
  let products=await userHelpers.getCartProductList(req.body.userid)
  let totalPrice=await userHelpers.getTotalAmount(req.body.userid)
  userHelpers.placeOrder(req.body,products,totalPrice).then((response)=>{



  })  



  console.log(req.body)
})

module.exports = router;
