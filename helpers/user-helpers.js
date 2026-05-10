
var db = require('../config/connection')
var collection = require('../config/collection')
var objectId = require('mongodb').ObjectId
const bcrypt = require('bcrypt')
const { propfind } = require('../routes/admin')
module.exports = {

    doSignup: async (userData) => {
        try {
            userData.Password = await bcrypt.hash(userData.Password, 10);
            const data = await db.get().collection(collection.USER_COLLECTION).insertOne(userData);
            // Return the full user object (excluding password) or at least the _id
            return { _id: data.insertedId, ...userData };
        } catch (error) {
            console.error("Signup error:", error);
            throw error;
        }
    },

    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: userData.Email })

            if (user) {
                bcrypt.compare(userData.Password, user.Password).then((status) => {
                    if (status) {
                        console.log("login success")
                        response.user = user
                        response.status = true
                        resolve(response);
                    }
                    else {
                        console.log("failed")
                        resolve({ status: false })
                    }
                })
            }
            else {
                console.log('login failed');
                resolve({ status: false })
            }
        })

    },


    addToCart:(proId, userId) => {
        

            let proObj={
              item:new objectId(proId),
               quantity:1
            }

            return new Promise(async(resolve,reject)=>{
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: new objectId(userId) });
            if (userCart) {
                let proExist=userCart.products.findIndex(product=>product.item==proId)
                console.log(proExist)
                if(proExist!=-1)
                {
                    db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ user: new objectId(userId),'products.item': new objectId(proId)},
                {

                    $inc:{'products.$.quantity':1}
                }).then(()=>{
                   resolve()
                })
                }
            else{
                    
                
               db.get().collection(collection.CART_COLLECTION)
                  .updateOne({ user: new objectId(userId)},
                      {
                            $push: { products:proObj}
                      })
                      .then((response)=>{

                        resolve()
                      })
                          
            }
        }
        
        
            else {
                let cartObj = {
                    user: new objectId(userId),
                    products: [proObj]
                };
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                    resolve()
                })
            }
        })
        },
    
    


    getCartProducts: (userId) => {
        
           return new Promise(async(resolve,reject)=>{
             
             let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
            
                { 
                    $match: { user: new objectId(userId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'

                    }


                   

                },
                {
                    $project:
                    {
                        item:1, quantity:1,  product:{$arrayElemAt:['$product',0]}
                    
                    }
                }


               /*  {

                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        let: {prodList:'$products'},
                       pipeLine:[
                        {
                             $match:{
                             $expr:{
                                $in:['$_id', "$$prodList"]
                             }
                       }
                        
                    }
             ],
             as:'cartItems'
            }
        }
 */
            ]).toArray()
           

            resolve(cartItems)
        })
        
    },


getCartCount:(userId)=>{

return new Promise(async(resolve,reject) =>{
    let count=0 
    let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:new objectId(userId)})
    if(cart)
    {
        count = cart.products.reduce((acc, product) => acc + product.quantity, 0)
    }
        resolve(count)
    })
},

changeProductQuantity:(details)=>{
    details.count=parseInt(details.count)
    return new Promise((resolve, reject)=>{
    db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id:new objectId(details.cart),'products.item': new objectId(details.product)},
                {

                    $inc:{'products.$.quantity':details.count}
                }).then((response)=>{
                   resolve(response)
                })


    })





},


removeFromCart: (details) => {
  return new Promise((resolve, reject) => {

    db.get().collection(collection.CART_COLLECTION)
      .updateOne(
        { _id: new objectId(details.cart) },
        {
          $pull: {
            products: {
              item: new objectId(details.product)
            }
          }
        }
      )
      .then(() => {
        resolve({ status: true })
      })
    })

},

getTotalAmount:(userId)=>{
  return new Promise(async(resolve,reject)=>{
             
             let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
            
                { 
                    $match: { user: new objectId(userId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'

                    }


                   

                },
                {
                    $project:
                    {
                        item:1, quantity:1,  product:{$arrayElemAt:['$product',0]}
                    
                    }
                },
                {
                   $group:{
                    _id:null,
                    total:{$sum:{$multiply:['$quantity', { $toDouble:'$product.Price'}]}}
                   }
                }

               /*  {

                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        let: {prodList:'$products'},
                       pipeLine:[
                        {
                             $match:{
                             $expr:{
                                $in:['$_id', "$$prodList"]
                             }
                       }
                        
                    }
             ],
             as:'cartItems'
            }
        }
 */
            ]).toArray()
            if (cartItems.length > 0) {
                console.log(cartItems[0].total);
                resolve(cartItems[0].total)
            } else {
                resolve(0)
            }
        })
        
    
}
}














