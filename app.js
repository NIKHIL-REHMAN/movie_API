const express = require('express')
const {open} = require('sqlite')
const path = require('path')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'moviesData.db')

let db = null

const intializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB error:${e.message}`)
    process.exit(1)
  }
}

intializeDBAndServer()

const convertDBObjectToResponseObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
    directorName: dbObject.director_name,
  }
}

//API 1

app.get('/movies/', async (request, response) => {
  const getMoviesQuery = `SELECT movie_name FROM movie;`
  const moviesArray = await db.all(getMoviesQuery)
  response.send(
    moviesArray.map(eachMovie => ({movieName: eachMovie.movie_name})),
  )
})

//API 2

app.post('/movies/', async (request, response) => {
  const {movieDetails} = request.body
  const { movieName, directorId, leadActor} = movieDetails
  const addMovieQuery = `
  INSERT INTO 
  movie(movie_id,director_id,movie_name,lead_actor)
  VALUES
  (
    ${movieId},
    '${movieName}',
    ${directorId},
    '${leadActor}'
  );`
  await db.run(addMovieQuery)
  const movieId = dbResponse.lastID
  response.send('Movie Successfully Added')
})

//API3
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuery = `SELECT * FROM movie WHERE movie_id = ${movieId};`
  const movieOp = await db.get(getMovieQuery)
  response.send(convertDBObjectToResponseObject(movieOp))
})

//API4
app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const movieDetails = request.body
  const {movieName, directorId, leadActor} = movieDetails
  const updateMovieQuery = `UPDATE movie(movie_name,director_id,lead_actor) 
  SET 
    movie_name = ${movieName},
    director_name = ${directorId},
    lead_actor= ${leadActor}
  WHERE movie_id = ${movieId};`
  await db.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

//API5

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteQuery = `DELETE FROM movie WHERE movie_id = ${movieId};`
  await db.run(deleteQuery)
  response.send('Movie Removed')
})

//API6

app.get('/directors/', async (request, response) => {
  const getDirectorsQuery = `SELECT * FROM director ORDER BY director_id;`
  const dirArr = await db.all(getDirectorsQuery)
  response.send(
    dirArr.map(eachDirector => convertDBObjectToResponseObject(eachDirector)),
  )
})

//API7

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getMovieWithDirId = `SELECT movie_name FROM movie WHERE director_id = ${directorId};`
  const dirMovieArr = await db.get(getMovieWithDirId)
  response.send(
    dirMovieArr.map(eachMovieName =>
      convertDBObjectToResponseObject(eachMovieName),
    ),
  )
})

module.exports = app
