package routes

import (
	"backend/database"
	"backend/models"
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
)

func RegisterEventRoutes(r *gin.Engine) {
	r.GET("/events", getEvents)
	r.POST("/events", postEvent)
	r.GET("/events/:id", getEventByID)
	r.DELETE("/events/:id", deleteEvent)
}

func getEvents(c *gin.Context) {
	var events []models.Event
	result := database.DB.Find(&events)

	if result.Error != nil {
		fmt.Println("Error fetching events:", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	fmt.Printf("Fetched %d events\n", len(events))

	for _, event := range events {
		fmt.Printf("Event: %+v\n", event)
	}

	c.JSON(http.StatusOK, events)
}

func postEvent(c *gin.Context) {
	var newEvent models.Event
	if err := c.ShouldBindJSON(&newEvent); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result := database.DB.Create(&newEvent)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusCreated, newEvent)
}

func getEventByID(c *gin.Context) {
	id := c.Param("id")
	var event models.Event
	if err := database.DB.First(&event, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}

	var roles []models.Role
	if err := json.Unmarshal(event.Roles, &roles); err == nil {
		event.Roles, _ = json.Marshal(roles)
	}

	c.JSON(http.StatusOK, event)
}

func deleteEvent(c *gin.Context) {
	id := c.Param("id")
	result := database.DB.Delete(&models.Event{}, id)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete event"})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Event deleted successfully"})
}
