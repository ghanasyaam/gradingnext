package models

type Teacher struct {
	Email        string `json:"email" gorm:"primaryKey;unique"`
	Name         string `json:"name"`
	Department   string `json:"department"`
	Position     string `json:"position"`
	ProfilePhoto string `json:"profilePhoto"`
	Points       int    `json:"points" gorm:"default:0"`
}
