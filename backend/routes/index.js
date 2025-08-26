var express = require('express');
var router = express.Router();
var userModel= require("../models/userModels")
const bcrypt= require("bcryptjs")
const jwt = require("jsonwebtoken")
const multer  = require('multer')
const secret = "mysecret"
const postModel =  require("../models/postModel")
const path = require("path")

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post("/signup",async (req, res) => {
  try{
      const {username, name,email,pwd} = req.body
      let emailCom = await userModel.findOne({email});
      if(emailCom){
        return res.json({
          success: false,
          msg: "Email already exist",
        })
      }
      else{
        bcrypt.genSalt(12, (err, salt) => {
         bcrypt.hash(pwd, salt,async function (err, hash) {
        let user  = await userModel.create({
          username,
          name,
          email,
          password: hash
        })
        
        return res.json({
          success: true,
          msg: "User created successfully",
        })
      });
    });
      }
    }
    catch(error){
        return res.json({
          success: false,
          msg : error.message,
        })
    }

});

router.post("/login", async (req,res) => {
   try{
      let {email,pwd} = req.body;
      let user = await userModel.findOne({email})
      if(!user){
        return res.json({
          success: false,
          msg: "User not found",
        })
      }
      
      else{
        bcrypt.compare(pwd,user.password, (err, result) => {
          if(result){
            let token = jwt.sign({email:user.email,userId:user._id},secret)
        

            return res.json({
              success: true,
              msg: "User logged in successfully",
              token,
              userId: user._id
            });
          }
          else{
            return res.json({
              success: false,
              msg: "Invalid password",
            })
          }
        })
      }

   }
   catch(error){

   }
})

//storage functionlity setUp...
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    let extName = path.extname(file.originalname)
    cb(null, file.fieldname + '-' + uniqueSuffix + extName)
  }
})

const upload = multer({ storage: storage })


router.post('/createPost', upload.single('image'),async function (req, res) {
   try{
    let{token, caption} = req.body;
    let decoded = jwt.verify(token,secret);
    let user = await userModel.findById(decoded.userId);
    if(!user){
      return res.json({
        success: false,
        msg: "User not found",
      })
    }
   

    // lets making post in this...
    let post = await postModel.create({
      caption,
      image: req.file.filename,
      uploadedBy: decoded.userId,
      likes: [],
    })

    return res.json({
      success: true,
      msg: "Post created successfully",
      postId : post._id
    })

   }catch(error){
      return res.json({
        success: false,
        msg: error.message
      })
   }
})

router.post("/toggleLike",async (req,res) => {
    try{
      let {token,postId} = req.body;
      let decoded = jwt.verify(token,secret)
      let user = await userModel.findById(decoded.userId);
      if(!user){
        return res.json({
          success: false,
          msg: "User not found",
        })
      }

      let post = await postModel.findById(postId);
      if(!post){
        return res.json({
          success: false,
          msg: "Post not found",
        })
      }
      
      //functionality for liking and unliking post by the user...
      if(post.likes.some(like => like.userId === decoded.userId)){
         post.likes.pull({userId: decoded.userId})
         await post.save()
         return res.json({
          sucess: true,
          msg: "Post unliked successfully",
          action: "dislike"
         })
      }
      else{
        post.likes.push({userId: decoded.userId})
        await post.save()
        return res.json({
          sucess: true,
          msg: "Post liked successfully",
          action: "like"
         })
      }
     
       
    }
    catch(error){
      return res.json({
        success: false,
        msg: error.message
      })
    }
})

router.post("/toggleFollow",async (req,res) => {
   try{
      let {token,userId} = req.body;
      let decoded = jwt.verify(token,secret)
      let user = await userModel.findById(decoded.userId);
      if(!user){
        return res.json({
          success: false,
          msg: "User not found",
        })
      }
      let otherUser = await userModel.findById(userId);
      if(!otherUser){
        return res.json({
          success: false,
          msg: "User not found",
        })
      }
      
      // you cannot follow yourself wala logic hai yeh to...
      if(userId === decoded.userId){
        return res.json({
          success: false,
          msg: "You cannot follow yourself",
        })
      }
       
      //follow unfollow logic is there...
      if(otherUser.followers.some(follower => follower.userId === decoded.userId)){
         otherUser.followers.pull({userId: decoded.userId})
         await otherUser.save()
         return res.json({
          success: true,
          msg: "User unfollowed successfully",
          action: "unfollow"
         })
      }
      else{
        otherUser.followers.push({userId: decoded.userId})
        await otherUser.save()
        return res.json({
          success: true,
          msg: "User followed successfully",
          action: "follow"
         })
      }
   }
   catch(error){
      return res.json({
        success: false,
        msg: error.message
      })
   }
})

router.post("/getPosts", async (req, res) => {
   try {
     let { token } = req.body;
     let decoded = jwt.verify(token, secret);
     let user = await userModel.findById(decoded.userId);
     
     if (!user) {
       return res.json({
         success: false,
         msg: "User not found",
       });
     }

     let posts = await postModel.find({});
    
     // Using map and Promise.all to ensure all async tasks are completed
     let fullData = await Promise.all(posts.map(async (post) => {
       let user = await userModel.findById(post.uploadedBy);
       return {
         post: {
           _id: post._id,
           caption: post.caption,
           likes: post.likes.length,
           image: post.image,
           date: post.date,
         },
         user: {
           username: user.username,
           followers: user.followers.length,
         },
       };
     }));

     return res.json({
       success: true,
       msg: "Posts fetched successfully",
       data: fullData,
     });
   } catch (error) {
     return res.json({
       success: false,
       msg: error.message,
     });
   }
});


module.exports = router;
