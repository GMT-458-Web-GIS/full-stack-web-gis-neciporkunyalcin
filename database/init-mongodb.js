// Run this file with: node database/init-mongodb.js

const mongoose = require('mongoose');
const Challenge = require('../backend/models/Challenge');
const Review = require('../backend/models/Review');
const Squad = require('../backend/models/Squad');

require('dotenv').config({ path: '../backend/.env' });

const seedData = async () => {
  try {
    await mongoose.connect('mongodb+srv://neciporkunyalcin_db_user:YHoauGZsXy8ewWS@cluster0.gml5iid.mongodb.net/nerede_yesek?appName=Cluster0');
    console.log('✅ MongoDB connected');

    // Clear existing data
    await Challenge.deleteMany({});
    await Review.deleteMany({});
    await Squad.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Sample Challenges
    const challenges = await Challenge.insertMany([
      {
        title: 'Spice Warrior',
        description: 'Visit 5 different restaurants and try spicy dishes',
        type: 'solo',
        difficulty: 3,
        requirements: {
          visit_count: 5,
          tags_required: ['spicy'],
          custom_days: 7
        },
        rewards: {
          xp: 150,
          badge: {
            name: 'Fire Breather',
            icon: '🌶️'
          }
        },
        is_active: true,
        community_stats: {
          total_participants: 23,
          total_completed: 8,
          completion_rate: 34.8
        }
      },
      {
        title: 'Ramen Week',
        description: 'Try ramen from 3 different restaurants this week',
        type: 'solo',
        difficulty: 2,
        requirements: {
          visit_count: 3,
          cuisine_types: ['Japanese'],
          time_constraint: 'weekly'
        },
        rewards: {
          xp: 100,
          badge: {
            name: 'Noodle Master',
            icon: '🍜'
          }
        },
        is_active: true
      },
      {
        title: 'Budget Challenge',
        description: 'Find 5 quality restaurants under 100 TL',
        type: 'community',
        difficulty: 3,
        requirements: {
          visit_count: 5,
          budget_max: 100,
          min_rating: 4.0,
          custom_days: 30
        },
        rewards: {
          xp: 200,
          badge: {
            name: 'Smart Eater',
            icon: '💰'
          }
        },
        is_active: true,
        end_date: new Date('2026-02-10')
      },
      {
        title: 'Around the World',
        description: 'Try 10 different international cuisines',
        type: 'solo',
        difficulty: 4,
        requirements: {
          visit_count: 10,
          cuisine_types: ['Japanese', 'Italian', 'Chinese', 'Mexican', 'Indian', 'Thai', 'French', 'Greek', 'Korean', 'Vietnamese'],
          custom_days: 30
        },
        rewards: {
          xp: 250,
          badge: {
            name: 'World Traveler',
            icon: '🌍'
          }
        },
        is_active: true
      }
    ]);

    console.log(`✅ Created ${challenges.length} challenges`);

    // Sample Reviews
    const reviews = await Review.insertMany([
      {
        restaurant_id: 1,
        user_id: 1,
        username: 'foodie_ali',
        rating: 5,
        comment: 'Amazing steaks! The meat quality is exceptional. Atmosphere is great too.',
        photos: ['https://example.com/photo1.jpg'],
        tags: ['authentic', 'cozy'],
        likes: 15,
        liked_by: [2, 3],
        visit_date: new Date('2026-01-05')
      },
      {
        restaurant_id: 2,
        user_id: 2,
        username: 'ayse_eats',
        rating: 4,
        comment: 'Good sushi, fresh ingredients. A bit pricey but worth it.',
        photos: ['https://example.com/photo2.jpg', 'https://example.com/photo3.jpg'],
        tags: ['authentic', 'quiet'],
        likes: 8,
        liked_by: [1],
        comments: [
          {
            user_id: 1,
            username: 'foodie_ali',
            text: 'I agree! The salmon was incredible.',
            created_at: new Date('2026-01-06')
          }
        ],
        visit_date: new Date('2026-01-04')
      },
      {
        restaurant_id: 5,
        user_id: 3,
        username: 'mehmet_chef',
        rating: 5,
        comment: 'Best köfte in Ankara! Traditional taste, huge portions.',
        tags: ['budget-friendly', 'authentic', 'fast-service'],
        likes: 22,
        liked_by: [1, 2],
        visit_date: new Date('2026-01-03')
      }
    ]);

    console.log(`✅ Created ${reviews.length} reviews`);

    // Sample Squad
    const squads = await Squad.insertMany([
      {
        name: 'Weekend Crew',
        squad_type: 'casual',
        creator_id: 1,
        members: [
          {
            user_id: 1,
            username: 'foodie_ali',
            preferences: {
              budget_min: 100,
              budget_max: 300,
              cuisine_preferences: ['Turkish', 'Italian'],
              dietary_restrictions: [],
              max_distance: 3000,
              atmosphere: 'casual'
            },
            current_location: {
              type: 'Point',
              coordinates: [32.8597, 39.9208]
            }
          },
          {
            user_id: 2,
            username: 'ayse_eats',
            preferences: {
              budget_min: 150,
              budget_max: 400,
              cuisine_preferences: ['Japanese', 'Vegan'],
              dietary_restrictions: ['vegetarian'],
              max_distance: 2000,
              atmosphere: 'quiet'
            },
            current_location: {
              type: 'Point',
              coordinates: [32.8573, 39.9179]
            }
          }
        ],
        squad_stats: {
          total_meetings: 12,
          favorite_restaurant: {
            restaurant_id: 5,
            restaurant_name: 'Köfteci Ramiz',
            visit_count: 4
          },
          avg_spending_per_person: 175,
          favorite_cuisine: 'Turkish',
          longest_decision_time: 45,
          fastest_decision_time: 3
        }
      }
    ]);

    console.log(`✅ Created ${squads.length} squads`);

    console.log('\n🎉 MongoDB seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();