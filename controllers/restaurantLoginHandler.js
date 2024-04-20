const bcrypt = require('bcrypt');
const restaurantDetails = require('../models/restaurantDetails');
const restaurantLogin = require('../models/restaurantLogin');

const registerRestaurant = async (req, res) => {
    try {
        const { name, contact, cuisineServed, email, password } = req.body;

        const existingRestaurant = await restaurantLogin.findOne({ email });
        if (existingRestaurant) {
            return res.status(400).json({ 
                error: "Email is already registered" 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newRestaurantDetails = new restaurantDetails({
            name,
            contact,
            cuisineServed
        });

        const savedRestaurantDetails = await newRestaurantDetails.save();

        const newRestaurantLogin = new restaurantLogin({
            details: savedRestaurantDetails._id,
            email,
            password: hashedPassword
        });

        const savedRestaurantLogin = await newRestaurantLogin.save();

        res.status(201).json({ 
            message: "Restaurant registered successfully", 
            restaurantDetails: savedRestaurantDetails, 
            restaurantLogin: savedRestaurantLogin 
        });

        // const savedRestaurantLogin = await newRestaurantLogin.save();

        // await savedRestaurantLogin.populate('details').execPopulate();

        // res.status(201).json({ 
        //     message: "Restaurant registered successfully", 
        //     restaurantLogin: savedRestaurantLogin 
        // });
    } catch (error) {
        console.error("Error registering restaurant:", error);
        res.status(500).json({ 
            error: "Internal server error" 
        });
    }
};

const login = async(req,res) => {
    try {
        const { email, password } = req.body;

        const restaurant = await restaurantLogin.findOne({ email });
        if (!restaurant) {
            return res.status(401).json({ 
                error: "Restaurant not registered" 
            });
        }

        const passwordMatch = await bcrypt.compare(password, restaurant.password);
        if (!passwordMatch) {
            return res.status(401).json({ 
                error: "Invalid password" 
            });
        }

        res.status(200).json({ 
            message: "Login successful" 
        });

    } catch (error) {
        console.error("Error logging in restaurant:", error);
        res.status(500).json({ 
            error: "Internal server error" 
        });
    }
}

const getRestaurantDetailsById = async (req, res) => {
    try {
        const { id } = req.params;

        const restaurant = await restaurantDetails.findById(id).populate('category').populate('menu');

        if (!restaurant) {
            return res.status(404).json({ 
                message: 'Restaurant details not found' 
            });
        }

        res.status(200).json({ 
            message : 'Data fetched successfully',
            restaurant
         });

    } catch (error) {
        console.error('Error fetching restaurant details:', error);
        res.status(500).json({ 
            message: 'Internal server error' 
        });
    }
};

module.exports = { registerRestaurant,login,getRestaurantDetailsById };