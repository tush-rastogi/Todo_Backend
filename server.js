const express = require('express');
const app = express();
const cors = require('cors');
app.use(express.json());
app.use(cors());

const knex = require('knex')({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    password: 'database',
    database: 'todolist'
  }
});

app.get('/', (req, res) => {
   knex.select()
    .table('tasks')
    .orderBy('id')
    .then(data => res.json(data));

})

app.delete('/deletetask/:id', (req, res) => {


  const { id } = req.params;
 
  knex.transaction(function (trx) {

    trx('tasks')
      .where('id', id)
      .del()
      .transacting(trx)
      .then(() => {

        return knex.select().table('tasks').orderBy('id').transacting(trx);
      })
      .then(trx.commit)
      .catch(trx.rollback)

  })
    .then(data => res.json(data));



})

app.post('/addtask', (req, res) => {

  const { task } = req.body;

     if(task===undefined||task==='')
     return res.status(400).json("Error")

  knex.transaction(function (trx) {

    knex.insert({ task: task }, ['*'])
      .into('tasks')
      .transacting(trx)
      .then(() => {

        return knex.select().table('tasks').orderBy('id').transacting(trx);
      })
      .then(trx.commit)
      .catch(trx.rollback)

  })
    .then(data => res.json(data))
    .catch(err=>res.status(400).json("Error"))

})

app.patch('/editask', (req, res) => {

  const { id, newTask } = req.body;

  
    knex.transaction(function(trx){
 
     knex('tasks')
    .where({ id: id })
    .update({
      task: newTask
    }, ['*'])
    .transacting(trx)
    .then((data) => {
       console.log(data);
      return knex.select().table('tasks').orderBy('id').transacting(trx);
    })
    .then(trx.commit)
    .catch(trx.rollback)


  }).then(data => res.json(data))
    .catch(err=>
      {
        
        res.status(400).json("Error")
      })
})

app.get('/fetchTask/:name',(req,res)=>{

  const {name}=req.params;

    if(name==='All'){

      knex.select()
    .table('tasks')
     .orderBy('id')
    .then(data => res.json(data));
     
    }

    else{
  
  let status=name==='Completed'?true:false;

  
    knex('tasks')
    .where('completed',status)
     .orderBy('id')
    .then(data=>res.json(data))

    }

})

app.patch('/toggleTask', (req, res) => {

  const { id, completed } = req.body;

  knex.transaction(function (trx) {
    knex('tasks')
      .where({ id: id })
      .update({
        completed: completed
      }, ['*'])
      .transacting(trx)
      .then(() => {

        return knex.select().table('tasks').orderBy('id').transacting(trx);
      })
      .then(trx.commit)
      .catch(trx.rollback)
  })
    .then(data => res.json(data));

})


app.listen(3001, () => {
  console.log("Server started on port 3001")
})