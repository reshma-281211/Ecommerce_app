var db = require('../config/connection')
var collection=require('../config/collection');
const { reject } = require('promise');
var objectID=require('mongodb').ObjectID
module.exports = {
    addProduct: (product, callback) => {
        console.log("Adding product:", product);

        db.get().collection('product').insertOne(product).then((data)=>
        {
            console.log(data);
            callback(data.insertedId)
        })
    },
    getAllProducts:()=>
    {
        return new Promise(async(resolve,reject)=>{
        let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
        resolve(products)
        })
    },

    deleteProduct:(prodId)=>{
  
    return new Promise((resolve, reject)=>{
    db.get.collection(collection.PRODUCT_COLLECTION).removeOne({_id:prodID}).then((response)=>{
        console.log(response)
        resolve(response)
    })

    })



    },
    
    getProductDetails:(prodID)=>{
        return new Promise((resolve,reject)=>{
        db.get.collection(collection.PRODUCT_COLLECTION).findOne({id:prodID}).then((response)=>{

        resolve(response)

        })
        })
    },

    updateProduct:(prodId,proDetails)=>{

    return new Promise((resolve,reject)=>{
    db.get.collection(collection.PRODUCT_COLLECTION).updateOne({_id:prodID},{
        $set:{
         Name:proDetails.Name,
         Description:proDetails.Description,
         Price:proDetails.Price,
         Category:proDetails.Category
        }
    }).then((response)=>{

     resolve(response)
    })
    })
    

    
getCartCount:(userId)=>{

return new Promise(async(resolve,reject) =>{
    let count=0 
    let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectID(userID)})
    if(cart)
    {
     
          count=cart.products.length

    }

    resolve(count)
})

}

    }
}
    




    

        
        /*Name: product.Name,
            Category: product.Category,
            Price: parseInt(product.Price), // convert to number
            Description: product.Description,
            Image: product.Image
        })
        .then((result) => {
            console.log("Product inserted:", result.insertedId);
            callback(result); // notify success
        })
        .catch((err) => {
            console.log("Insertion error:", err);
            callback(err, null); // notify error
        });
    }*/
