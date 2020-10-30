const express = require("express");
const cors = require("cors");
const { v4: uuid, validate: isUuid } = require('uuid');

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

// MIDDLEWARES

function validateProjectId(request, response, next) {
    const {id} = request.params;

    if(!isUuid(id)) return response.status(400).json({error: "Invalid project ID"})

    return next()
}

app.use("/repositories/:id", validateProjectId);

app.use("/repositories/:id/like", validateProjectId);


// APIS

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const {title, url, techs} = request.body;

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0
  };

  repositories.push(repository)

  return response.status(201).json(repository)
});

app.put("/repositories/:id", (request, response) => {
  const {id} = request.params;
  const {title, url, techs} = request.body;

  const repositoryIndex = repositories.findIndex(project => project.id === id);

  if(repositoryIndex < 0) return response.status(400).json({error: "repository not found"})

  const newTitle = title ? title : repositories[repositoryIndex].title;
  const newUrl = url ? url : repositories[repositoryIndex].url;
  const newTechs = techs ? techs : repositories[repositoryIndex].techs;
    
  const repository = {
    id,
    title: newTitle,
    techs: newTechs,
    url: newUrl,
    likes: repositories[repositoryIndex].likes
  };
     
  repositories[repositoryIndex] = repository;

  return response.json(repository)
});

app.delete("/repositories/:id", (request, response) => {
  const {id} = request.params;

  const repositoryIndex = repositories.findIndex(project => project.id === id);

  if(repositoryIndex < 0) return response.status(400).json({error: "repository not found"}) 

  repositories.splice(repositoryIndex, 1);

  return response.status(204).send()
});

app.post("/repositories/:id/like", (request, response) => {
  const {id} = request.params;

  const repositoryIndex = repositories.findIndex(project => project.id === id);

  if(repositoryIndex < 0) return response.status(400).json({error: "repository not found"}) 

  repositories[repositoryIndex].likes += 1;

  return response.json(repositories[repositoryIndex])
});

module.exports = app;
