package database

import (
	"log"

	"backend/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	dsn := "host=localhost user=postgres password=password dbname=grading port=5432 sslmode=disable TimeZone=Asia/Kolkata"
	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("❌ Failed to connect to database:", err)
	}

	err = DB.AutoMigrate(&models.Event{})
	if err != nil {
		log.Fatal("❌ Migration failed:", err)
	}

	log.Println("✅ Successfully migrated database!")
}
