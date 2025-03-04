package main

import (
	"github.com/gin-contrib/cors"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Teacher struct {
	ID           uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	Name         string `json:"name"`
	Department   string `json:"department"`
	Position     string `json:"position"`
	ProfilePhoto string `json:"profilePhoto"`
}

var db *gorm.DB

func main() {
	var err error
	dsn := "host=localhost user=postgres password=Tagliafic@0 dbname=grading port=5432 sslmode=disable TimeZone=Asia/Kolkata"
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	db.AutoMigrate(&Teacher{})

	router := gin.Default()
	router.Use(cors.Default())

	router.GET("/teachers", getTeachers)
	router.POST("/teachers", postTeachers)

	router.Run("localhost:8081")
}

func postTeachers(c *gin.Context) {
	var newTeacher Teacher

	if err := c.BindJSON(&newTeacher); err != nil {
		log.Println("Error binding JSON:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result := db.Create(&newTeacher)
	if result.Error != nil {
		log.Println("Error inserting teacher:", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	log.Println("Inserted teacher:", newTeacher)
	c.JSON(http.StatusCreated, newTeacher)
}

func getTeachers(c *gin.Context) {
	var teachers []Teacher
	db.Find(&teachers)
	c.JSON(http.StatusOK, teachers)
}
