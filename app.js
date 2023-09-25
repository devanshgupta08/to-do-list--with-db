const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const { Schema } = mongoose;
const date = require(__dirname + "/date.js");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set('view engine', 'ejs');
let items = [];
const day = date.getDate();

mongoose.connect('mongodb://127.0.0.1:27017/todolistDBnew');

const itemSchema = new Schema({                                     
  name: String,
});
const listSchema = new Schema({                                     
  name: String,
  itemsarr:[itemSchema]
});
const Item = mongoose.model('Item', itemSchema);
const List = mongoose.model('List', listSchema);
const item1 = new Item(
  {
      name: "To cook Food"
  }
);
const item2 = new Item(
  {
      name: "To make flying cars"
  }
);
const item3 = new Item(
  {
      name: "To go on Mars"
  }
);
const defaultItems = [item1,item2,item3];

// Item.insertMany(defaultItems)
//   .then(function (docs) {
//     console.log('Default Items inserted');
//   })
//   .catch(function (err) {
//       console.error('Error inserting default Items:', err);
//     });
  async function insertItemsinlcarr() {
      try {
         items = await Item.find({});   
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    }

    app.get("/", async function (req, res) {
      
      try {
        await insertItemsinlcarr(); // Wait for items to be fetched from the database
        if (items.length === 0) {
          await Item.insertMany(defaultItems); // Wait for default items to be inserted
          console.log('Default Items inserted');
          res.redirect("/");
        } else {
          res.render("list", { listTitle: day, newListItems: items });
        }
      } catch (error) {
        console.error('Error in route handler:', error);
        res.status(500).send('Error in route handler');
      }
    });
    app.get("/:customListName", function (req, res) {
      const customListName = req.params.customListName;

      async function checkList(){
        try {
          const doc = await List.findOne({name:customListName});
          if(doc)
          {
            res.render("list", { listTitle: doc.name, newListItems: doc.itemsarr });
          }
          else
        {
          const list1 = new List({
            name:customListName,
            itemsarr:defaultItems
          })
          list1.save();
         res.redirect("/" + customListName);
        }
    } catch (error) {
        console.error('Error fetching items:', error);
    }
}
 checkList();
    });

app.post("/", function (req, res) {

  const item = req.body.newItem;
  const lname = req.body.list;
  const newTodo = new Item(
    {
        name: item
    });
    if(lname == day)
    {
      newTodo.save();
      res.redirect("/");
    }
    else{
      async function todoObj()
      {
      const foundList = await List.findOne({name:lname});
      foundList.itemsarr.push(newTodo);
      foundList.save();
      res.redirect("/"+lname);
      }
      todoObj();
    }

});
app.post("/delete", function (req, res) {
  async function deleteItem() {
    try {
      const condition1 = { _id: req.body["itemId"] }; 

      const result1 = await Item.deleteOne(condition1);
  
      if (result1.deletedCount === 1) {
        console.log("Document deleted successfully.");
      } else {
        console.log("Document not found or not deleted.");
      }
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  }
  deleteItem();
  res.redirect("/");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
