package routes

import (
	"backend/database"
	"backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func RegisterTeacherRoutes(r *gin.Engine) {
	r.GET("/teachers", getTeachers)
	r.POST("/teachers", postTeachers)
}

func getTeachers(c *gin.Context) {
	var teachers []models.Teacher
	result := database.DB.Find(&teachers)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, teachers)
}

func postTeachers(c *gin.Context) {
	var newTeacher models.Teacher
	if err := c.ShouldBindJSON(&newTeacher); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result := database.DB.Create(&newTeacher)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusCreated, newTeacher)
}
