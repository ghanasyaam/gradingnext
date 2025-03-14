package models

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Role struct {
	Role      string   `json:"role"`
	Points    string   `json:"points"`
	TeacherID []string `json:"teachers"`
}

type Event struct {
	ID          uint            `json:"id" gorm:"primaryKey"`
	Name        string          `json:"name"`
	Date        string          `json:"date"`
	Time        string          `json:"time"`
	Description string          `json:"description"`
	Roles       json.RawMessage `json:"roles" gorm:"type:jsonb"`
	DeletedAt   gorm.DeletedAt  `json:"deleted_at" gorm:"index"`
}

func (e *Event) AfterFind(tx *gorm.DB) (err error) {
	var roles []Role
	if len(e.Roles) > 0 {
		if err := json.Unmarshal(e.Roles, &roles); err != nil {
			fmt.Println("Error unmarshalling roles:", err)
			return err
		}
	}

	for i := range roles {
		if roles[i].TeacherID == nil {
			roles[i].TeacherID = []string{}
		}
	}

	e.Roles, err = json.Marshal(roles)
	return err
}

func GetEventsHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var events []Event
		if err := db.Find(&events).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve events"})
			return
		}

		fmt.Println("Sending events:", events)

		c.JSON(http.StatusOK, events)
	}
}

func UpdateEventHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		var event Event

		if err := db.First(&event, id).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
			return
		}

		var updatedEvent Event
		if err := c.ShouldBindJSON(&updatedEvent); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}

		event.Name = updatedEvent.Name
		event.Date = updatedEvent.Date
		event.Time = updatedEvent.Time
		event.Description = updatedEvent.Description
		event.Roles = updatedEvent.Roles

		if err := db.Save(&event).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update event"})
			return
		}

		c.JSON(http.StatusOK, event)
	}
}
