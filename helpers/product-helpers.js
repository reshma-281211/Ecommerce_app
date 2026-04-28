var db = require('../config/connection')
var collection=require('../config/collection')
var ObjectId=require('mongodb').ObjectId
module.exports = {
    addProduct: (product, callback) => {
        console.log("Adding product:", product);

        db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data)=>
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
    deleteProduct:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:new ObjectId(proId)}).then((response)=>{
                console.log(response);
                resolve(response)
            })
        })
    },
    getProductDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:new ObjectId(proId)}).then((product)=>{
                resolve(product)
            })
        })
    },
    updateProduct:(proId, productDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:new ObjectId(proId)},{
                $set:{
                    Name:productDetails.Name,
                    Description:productDetails.Description,
                    Price:productDetails.Price,
                    Category:productDetails.Category
                }
            }).then((response)=>{
                resolve()
            })
        })
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
