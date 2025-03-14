package main

import (
	"backend/database"
	"backend/routes"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	database.InitDB()

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowAllOrigins:  true,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	routes.RegisterEventRoutes(r)
	routes.RegisterTeacherRoutes(r)

	port := ":8081"
	log.Println("✅ Server is running on port", port)
	if err := r.Run(port); err != nil {
		log.Fatal("❌ Failed to start server:", err)
	}
}
