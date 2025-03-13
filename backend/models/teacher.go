package models

import "gorm.io/gorm"

// Teacher Model
type Teacher struct {
	gorm.Model
	Name         string `json:"name"`
	Department   string `json:"department"`
	Position     string `json:"position"`
	ProfilePhoto string `json:"profilePhoto"`
	Points       int    `json:"points" gorm:"default:0"`
}
