//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


//connect to MongoDB by specifying port to access MongoDB server
main().catch(err => console.log(err));
 
async function main() {
  await mongoose.connect('mongodb://localhost:27017/todolistDB');
  }

  //create a SCHEMA that sets out the fields each document will have and their datatypes
const itemsSchema = new mongoose.Schema ({
	name: String 
})

//create a MODEL , moongse automaticaly drops capital I and make prural fruits, lodash
const Item = new mongoose.model ("Item", itemsSchema)

//create a DOCUMENT
const item1 = new Item ({
	name: "Welcome to your ToDoList!",
})
const item2 = new Item ({
	name: "Hit the + to add the item",
})
const item3 = new Item ({
	name: "<--Hit this to delete an item",
})
 
const defaultItems =[item1,item2,item3]

// list schema

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
})

const List = new mongoose.model ("List", listSchema)


app.get("/", function(req, res) {

  //find
  Item.find({},function (err, foundItems) {
    if (foundItems.length===0) {
      Item.insertMany(defaultItems,function (err) {
        if(err)
        {console.log(err);}
        else{console.log("sucessfull saved all items");}
      })
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
   
  
 })

});

//dynamic route using Express Route Parameters

app.get("/:customListName",function (req,res) {
  const customListName= _.capitalize(req.params.customListName);

  List.findOne({name: customListName},function (err,foundList) {
if (!err) {
     if (!foundList) {
         //create a new list
         const list = new List ({
          name: customListName,
          items: defaultItems
        })
        list.save();
        res.redirect("/"+customListName);
     } else {
              //shows the existing list
              res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
     }
}
  })



})

app.post("/", function(req, res){

  const itemName = req.body.newItem; // name from input text
  const listName=req.body.list;  // value from button
 
  const item = new Item({
    name: itemName
  })

  if (listName==="Today") {
    // add items to default list
    item.save();
    res.redirect("/");
  } else {
    //add items to customized list, remember space error

    List.findOne({name: listName},function (err,foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
    
  }


});

app.post("/delete",function (req,res) {
  const checkedItemId=req.body.cbox;
  const listName = req.body.listName; //value

  if (listName==="Today") {
      // also can use findByIdAndRemove , (space error id=24)
  Item.deleteOne({_id: checkedItemId},function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("success fully deleted");
      res.redirect("/");
    }
  })
  } else {
       //delete using findOneANDupdateOne, $pull which accepts array
     
       List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}},function (err,foundList) {
             if (err) {
               console.log(err);
             } else {
                  res.redirect("/"+listName);
             }
       })
  }


})



// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

// app.get("/about", function(req, res){
//   res.render("about");
// });

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
