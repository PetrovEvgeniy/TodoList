const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const { urlencoded } = require("body-parser");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const today = new Date();

mongoose.connect("mongodb+srv://evgeniypetrov945:admin123admin@cluster0.7sb3pm3.mongodb.net/todolistDB");

//Schemas
const itemSchema = {
    name: String
}

const listShema = {
    name: String,
    items: [itemSchema]
}

//Models
const Item = mongoose.model("Item",itemSchema);
const List = mongoose.model("List",listShema);



//Default entries
// const item1 = new Item ({name: "Wake up early"});
// const item3 = new Item ({name: "Eat breakfast"});
// const item2 = new Item ({name: "Brush your teeth"});

// const defaultItems = [item1,item2,item3];

// Item.insertMany(defaultItems)
// .then((res) => console.log(res))
// .catch((err) => console.log(err))

// Item.findOne({name: "Wake up early"})
// .then(res => console.log("Item with that name was found"))
// .catch(err => console.log(err));

var options = {
    weekday: "long",
    day: "numeric",
    month: "long"
}

var day = today.toLocaleDateString("en-UK",options);

app.get("/", (req,res) => {
    
    res.redirect("/today");
    
})

app.get("/:customListPath", (req,res) => {
    
    const listName = _.lowerCase(req.params.customListPath);

    if(listName === "today"){
        Item.find()
        .then(responseResult => {
            res.render("list",{day: day,listName: listName, todoListItems: responseResult})
        })
        .catch(err => console.log(err));
    }
    else{

        //Check if path excists
        List.findOne({name: listName})
        .then((responseResult) => {
            if(responseResult){
                //Render custom list
                
                const items = responseResult.items;
    
                res.render("list",{day: day,listName: listName, todoListItems: items})
            }
            else{
     
                //Create list
                const list = new List({
                    name: listName,
                    items: []
                });
                
                
                //Save list and render new page
                list.save()
                .then(res.render("list",{day: day, listName: listName, todoListItems: []}))
                .catch(err => console.log(err));
            }
    
           
        })
        .catch(err => console.log(err))
    }

    
})


app.post("/:listName", (req,res) => {
    const noteText = req.body.noteText;
    const listName = _.lowerCase(req.params.listName);

    
    if(noteText!==""){
        const note = new Item({
            name: noteText
        });


        if(listName === "today"){
            note.save()
            .then(() => {
                res.redirect(`/${listName}`); 
            })
            .catch(err => console.log(err));;
        }
        else{
            List.updateOne({name: listName},{$push: {items: note}})
            .then(() => {
                res.redirect(`/${listName}`); 
            })
            .catch(err => console.log(err));
        }



    }
})

app.post("/:listName/delete/:id", (req,res) => {
    const noteId = req.params.id;
    const listName = _.lowerCase(req.params.listName);


    //Perform deletion
    if(listName === "today"){        
        Item.findByIdAndDelete(noteId)
        .then(res.redirect(`/${listName}`))
        .catch(err => console.log(err));
    }
    else{
        List.updateOne({name:listName},{$pull:
             {items: {_id: noteId}}})
        .then(res.redirect("/"+listName))
        .catch(err => console.log(err));
    }

});


let port = process.env.PORT;
if(port == null || port == ""){
    port = 3000;
}

app.listen(port, (req,res) => {
    console.log(`The server is now listenig at port ${port}!`);
})