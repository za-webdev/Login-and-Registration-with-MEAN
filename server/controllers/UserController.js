let mongoose = require("mongoose");
let User = mongoose.model("User");
let bcrypt = require("bcrypt-as-promised");

class UserController{
	// index(req,res){

	// 	res.render("index",{
	// 		"errors":req.session.errors
	// 	});
	// }

	register(req,res){
		let errors = [];

		User.find({email:req.body.email},(err,user)=>{
			console.log("USER: ",user);

			if(err){
				console.log(err);
			}else{ 
				if(user.length > 0){ // If this person exists, don't let them register, someone already has this email.
					console.log("USER WITH EMAIL:"+req.body.email+" ALREADY EXISTS.");
					errors.push("Error Email already Exits");
					req.session.errors =errors;
					res.json({message: errors});
				}

				let newUser = new User(req.body);

				bcrypt.hash(req.body.password,10)
				.then(hash => {
					newUser.password = hash;

					newUser.save((err,user)=>{
						if(err){
							console.log(err);
							errors.push("Error in BCRYPT");
							req.session.errors =errors;
							res.json({message:errors});
						}

						req.session.user_id = newUser._id;
						console.log(newUser);
						res.json({meassage:"User successfully created",user:user});
					});
				})
				.catch(error => {
					console.log("BCRYPT ERROR password : "+error);
					errors.push("Error in brypting password");
					req.session.errors =errors;
					res.json({message:errors});
				});

			}
		});
	}

	login(req,res){
		let errors = [];

		User.find({email:req.body.email},(err,user)=>{
			if(err){
				errors.push("Failed to lookup user");
				req.session.errors =errors;
				res.json({message:errors});
			}else{
				if(user[0]){
					bcrypt.compare(req.body.password,user[0].password)
					.then(()=>{
						req.session.user_id = user[0]._id;
						res.json({message:"Login Successful"});
					})
					.catch((err)=>{
						console.log("CATCH:",err);
						errors.push("Incorrect password");
						req.session.errors =errors;

						res.json({message:errors});
					});					
				}else{



					console.log("USER: "+req.body.email+" DOES NOT EXIST!!");
					errors.push("Email doesnot exits");
						req.session.errors =errors;
					res.json({meassage:errors});
				}
			}
		});
	}
}

module.exports = new UserController();