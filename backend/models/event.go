package models

import (
	"encoding/json"
	"gorm.io/gorm"
)

// Role struct to represent roles in an event
type Role struct {
	Role      string `json:"role"`
	Points    string `json:"points"`
	TeacherID []uint `json:"teachers"`
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
	if err := json.Unmarshal(e.Roles, &roles); err != nil {
		return err
	}

	for i := range roles {
		if roles[i].TeacherID == nil {
			roles[i].TeacherID = []uint{}
		}
	}

	e.Roles, err = json.Marshal(roles)
	return err
}
