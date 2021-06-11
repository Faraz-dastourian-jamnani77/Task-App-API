const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/users')
const auth = require('../middleware/auth')
const {sendWelcomeEmail,canceledEmail} = require('../emails/email')
const router = new express.Router()

//Users Collection


router.post('/users', async (req, res) => {
          const user = new User(req.body)
          try {
                    await user.save()
                    sendWelcomeEmail(user.email,user.name)
                    const token = await user.generateAuthToken()
                    res.send( {user,token} )
                    res.status(201).send(user)
          } catch (e) {
                    res.status(400).send(e)
          }

})
router.post('/users/login',async (req,res)=>{
      try{
            const user = await User.findByCredentials(req.body.email,req.body.password)
            const token = await user.generateAuthToken()
            res.send( {user,token} )
      
      }catch(e){
            res.status(400).send()

      }
})


router.post('/users/logout',auth,async(req,res)=>{
      try{
            req.user.tokens = req.user.tokens.filter(token=>{
                  return token.token !== req.token
            })
            await req.user.save()
            res.send()
      }catch(e){
            res.status(500).send()

      }
})
router.post('/users/logoutAll',auth,async(req,res)=>{
      try{
            req.user.tokens = []
            await req.user.save()
            res.send()
      }catch(e){
            res.status(500).send()

      }
})



router.get('/users/myProfile',auth,async (req, res) => {
          res.send(req.user)
})

router.get('/users/:id', async(req, res) => {
          const _id = req.params.id
          try{
                    const user = await User.findById(_id)
                    if (!user) {
                    return res.status(404).send()
                    }
                    res.send(user)
          }
          catch(e){
                    res.status(500).send()

          }
})

router.patch('/users/myProfile', auth,async(req,res)=>{
          const updates = Object.keys(req.body)
          const allowedUpdates = ['name','email','password','age']
          const isValidOperation = updates.every(update => allowedUpdates.includes(update) )
          
          if(!isValidOperation){
                    return res.status(400).send({error: "invalid updates :("})
          }
          try{    
                
                  updates.forEach(update=>{
                        req.user[update] = req.body[update]
                  })

                  await req.user.save()
                 
                    res.send(req.user)
          
          }catch(e){
                    res.status(400).send(e)

          }
})
router.delete('/users/myProfile',auth,async (req,res)=>{
          try{
                const user = await User.findByIdAndDelete(req.user._id)
            //     if(!user){
            //             return  res.status(404).send()
            //     }
                
                await req.user.remove()
                canceledEmail(user.email,user.name)
                
                res.send(req.user)   
          }
          catch(e){
                    res.status(500).send()
          }
})


const upload = multer({
      limits:{
            fileSize:1000000
      },
      fileFilter(req,file,cb){
            if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
                  return cb(new Error('Please upload an image file!!!'))
            }
            cb(undefined,true)
      }
})


router.post('/users/me/avatar',auth,upload.single('avatar'), async (req,res)=>{
      
      const buffer = await sharp(req.file.buffer).resize({width:200,height:200}).png().toBuffer()

      req.user.avatar = buffer
      await req.user.save()
      
      
      
      res.status(200).send()

},(error,req,res,next)=>{
      res.status(400).send({error:error.message})

})




router.delete('/users/me/avatar', auth, async (req,res)=>{
      req.user.avatar = undefined

      await req.user.save()
      
      
      res.status(200).send()

})



router.get('/users/:id/avatar',async (req,res)=>{
      try{
            const user = await User.findById(req.params.id)
            if(!user || !user.avatar){
                  throw new Error()
            }

            res.set('Content-Type', 'image/png')
            res.send(user.avatar)
      }catch{
            res.status(404).send()
      }
})








module.exports = router









