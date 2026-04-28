var express = require('express');
var router = express.Router()
const fs = require('fs')
const productHelpers=require('../helpers/product-helpers')
var db = require('../config/connection')
var collection=require('../config/collection')

/* GET users listing. */
router.get('/', function(req, res, next) {
 productHelpers.getAllProducts().then((products)=>{
   console.log(products)
   res.render('admin/view-products', { admin:true,products})
 })
});


 
 router.get('/add-product', function(req, res){
 
   res.render('admin/add-product')

 })

router.post('/add-product', (req, res) => {
  
    console.log(req.body)
    console.log(req.files.Image)
    productHelpers.addProduct(req.body, (_id)=>
    {
      let image=req.files.Image
      let imageName = _id + '.jpg';
      console.log(_id);
      image.mv('./public/product-images/'+imageName,(err,done)=>{
      if(!err)
        {
               res.render('admin/add-product')
        }
        else{
          console.log("error"+err);
        }
      })

    })
   
  })
   
   
    // console.log("PRODUCT:", product)

    // ✅ STEP 2: INSERT product
   /* let response = await db.get().collection('product').insertOne(product)

    // ✅ STEP 3: IMAGE UPLOAD (SAFE)
    if (req.files && req.files.Image) {
      let image = req.files.Image
      let imagePath = './public/images/' + response.insertedId + '.jpg'

      image.mv(imagePath, (err) => {
        if (err) console.log("Image error:", err)
      })
    }

    res.redirect('/admin')

  } catch (error) {
    console.log("ERROR:", error)
    res.status(500).send("Server Error")
  }*/



router.get('/delete-product/:id', (req, res) => {
    let proId = req.params.id
    productHelpers.deleteProduct(proId).then((response) => {
        let path = './public/product-images/' + proId + '.jpg'
        if (fs.existsSync(path)) {
            fs.unlink(path, (err) => {
                if (err) console.log(err)
            })
        }
        res.redirect('/admin/')
    })
})

router.get('/edit-product/:id', async(req,res)=>{
let product=await productHelpers. getProductDetails(req.params.id) 
console.log(product)
res.render('admin/edit-product',{product})
  
})

router.post('/edit-product/:id', (req,res)=>{

  productHelpers.updateProduct(req.params.id,req.body).then(()=>{

  res.redirect('/admin')
  if(req.files.Image)
  {

    let image=req.files.Image
    let id=req.params.id
    image.mv('./public/product-images/'+id+ '.jpg')
  }

  })

})




module.exports = router;
