const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  const user = users.find(user => user.username === username)
  
  if(!user){
    return response.status(400).json({erro: "User not Found"})
  }

  request.user = user
  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body
  users.push({
    id: uuidv4(), name, username, todos: [],
})
  response.status(201).send(users)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request
  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {title, deadline} = request.body

  const createTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline), 
    created_at: new Date(), 
  }

  user.todos.push(createTodo)

  return response.status(201).send(createTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params
  const {user} = request
  const { title, deadline} = request.body

  const selectedTodo = user.todos.find(todo => todo.id === id);
  selectedTodo.title = title
  selectedTodo.deadline = deadline

  response.status(201).send(selectedTodo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {id} = request.params
  const {user} = request
  const { done } = request.body

  const selectedTodo = user.todos.find(todo => todo.id === id);
  selectedTodo.done = done

  response.status(201).send(selectedTodo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params
  const {user} = request

  const selectedTodo = user.todos.find(todo => todo.id === id);
  user.todos.splice(user.todos, 1)
  return response.status(200).json(selectedTodo).send()
});

module.exports = app;