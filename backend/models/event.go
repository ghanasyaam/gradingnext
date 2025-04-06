package models

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Role struct {
	Role      string   `json:"role"`
	Points    int      `json:"points"`
	Headcount int      `json:"headcount"`
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
	var rawRoles []map[string]interface{}
	if err := json.Unmarshal(e.Roles, &rawRoles); err != nil {
		fmt.Println("Error unmarshalling roles:", err)
		return err
	}

	var roles []Role
	for _, rawRole := range rawRoles {
		role := Role{
			Role:      convertToString(rawRole["role"]),
			Points:    convertToInt(rawRole["points"]),
			Headcount: convertToInt(rawRole["headcount"]),
			TeacherID: convertToStringSlice(rawRole["teachers"]),
		}
		roles = append(roles, role)
	}

	e.Roles, _ = json.Marshal(roles)
	return nil
}

func GetEventsHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var events []Event
		if err := db.Find(&events).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve events"})
			return
		}
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

		if len(updatedEvent.Roles) > 0 {
			var updatedRoles []Role
			if err := json.Unmarshal(updatedEvent.Roles, &updatedRoles); err == nil {
				var existingRoles []Role
				_ = json.Unmarshal(event.Roles, &existingRoles)

				for i := range updatedRoles {
					if updatedRoles[i].Headcount == 0 {
						for _, existingRole := range existingRoles {
							if updatedRoles[i].Role == existingRole.Role {
								updatedRoles[i].Headcount = existingRole.Headcount
								break
							}
						}
					}
				}
				event.Roles, _ = json.Marshal(updatedRoles)
			}
		}

		if err := db.Save(&event).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update event"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"event":   event,
			"message": "Event updated successfully",
		})
	}
}

//
// ─── HELPER FUNCTIONS FOR TYPE CONVERSION ──────────────────────────────────────
//

func convertToString(input interface{}) string {
	switch v := input.(type) {
	case string:
		return v
	case fmt.Stringer:
		return v.String()
	case float64:
		return strconv.Itoa(int(v))
	case int:
		return strconv.Itoa(v)
	default:
		return ""
	}
}

func convertToInt(input interface{}) int {
	switch v := input.(type) {
	case float64:
		return int(v)
	case int:
		return v
	case string:
		i, err := strconv.Atoi(v)
		if err != nil {
			return 0
		}
		return i
	default:
		return 0
	}
}

func convertToStringSlice(input interface{}) []string {
	if input == nil {
		return []string{}
	}

	var strSlice []string
	switch v := input.(type) {
	case []string:
		return v
	case []interface{}:
		for _, val := range v {
			strSlice = append(strSlice, convertToString(val))
		}
	}
	return strSlice
}
