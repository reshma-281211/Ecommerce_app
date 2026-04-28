
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
                let proExist=userCart.products.findIndex(product=>product.item===proId)
                console.log(proExist)
                if(proExist!=-1)
                {
                    db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ 'product.item': new objectId(proId)},
                {

                    $inc:{'product.$.quantity':1}
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
     
          count=cart.products.length

    }

  
        resolve(count)
    })
}

}










