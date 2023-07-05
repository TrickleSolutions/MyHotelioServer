const HotelModel = require("../../Model/HotelModel/HotelModel");
const VendorModel = require("../../Model/HotelModel/VendorModel");


const RegisterHotel = async (req, res) => {
    const customerId = req.params.id;

    // Check if the hotel is already registered or not
    const IsRegistered = await HotelModel.findOne({ hotelEmail: req.body.hotelEmail });
    if (IsRegistered) {
        return res.status(409).json({ error: true, message: "Hotel Already Registered With this Email" });
    }

    // Register the hotel
    const response = await new HotelModel(req.body).save();
    if (!response) {
        return res.status(400).json({ error: true, message: "Not Registered" });
    }

    // Find the user and update this hotel id
    const Vendor = await VendorModel.findOneAndUpdate(
        { _id: customerId },
        { $push: { hotels: response._id } },
        { new: true, upsert: true }
    );
    if (!Vendor) {
        // If the ID is not pushed into the customer's data, consider the hotel as unregistered
        await response.remove();
        return res.status(400).json({ error: true, message: "Hotel Not Registered. Try Again" });
    }

    res.status(200).json({ error: false, data: response });
};


// Get all the data 
const GetAllHotel = async (req, res) => {

    try {
        const AllData = await HotelModel.find({})
        if (!AllData) return res.status(400).json({ error: true, message: "No Data Found" })
        res.status(200).json({ error: true, data: AllData })
    } catch (error) {
        res.status(500).json({ error })
    }

}

const GetSingleHotel = async (req, res) => {
    const Id = req.params.id
    try {
        // check the hotel with id 
        const isHotel = await HotelModel.findById(Id)
        if (!isHotel) return res.status(404).json({ error: true, message: "No Data Found" })
        // return the response 
        res.status(200).json({ error: false, data: isHotel });
    } catch (error) {
        res.status(500).json({ error })
    }
}


// Update the Hotel Data 
const UpdateHotelData = async (req, res) => {
    const id = req.params.id

    try {
        const isUser = await HotelModel.findById(id)
        if (!isUser) return res.status(404).json({ error: true, message: "No Data Found" })
        // Find the hotel  
        const isFoundandUpdated = await HotelModel.findByIdAndUpdate(id, {
            ...req.body,
            hotelEmail: isUser.hotelEmail
        }, { new: true });
        if (!isFoundandUpdated) return res.status(400).json({ error: true, message: "No Updated" })

        res.status(200).json({ error: false, data: isFoundandUpdated, message: "Updated Successfully " })
    } catch (error) {
        res.status(500).json({ error })
    }
}

const DeleteSingleHotel = async (req, res) => {
    // id of the user to delete
    const id = req.params.id

    // find the data and delete the data
    HotelModel.findByIdAndDelete(id).then(() => {
        res.status(200).json({ error: false, message: "Deleted Successfully" })
    }).catch((err) => {
        res.status(500).json(err)
    })
}

// delet all the dat
const DeleteAllHotelData = async (req, res) => {

    // find the data and delete the data
    HotelModel.deleteMany({}).then(() => {
        res.status(200).json({ error: false, message: "Deleted Successfully" })
    }).catch((err) => {
        res.status(500).json(err)
    })
}


// Search Api for Hotel or location Search 
const ReqHotelData = async (req, res) => {
    const { searchLocation } = req.query;
    // hotel data 
    const requested = req.params.data.split(",")
    try {
        // Get all the data from the API
        const allData = await HotelModel.find({}).select(requested);
        let modifiedData;
        if (searchLocation === true) {
            // Concatenate the fields and create a new field called "concatenatedData"
            modifiedData = allData.map((data) => ({
                ...data._doc,
                concatenatedData: `${data.hotelName} , ${data.hotelAddress}`,
            }));
        } else {
            modifiedData = allData;
        }

        res.status(200).json({ error: false, data: modifiedData });
    } catch (error) {
        res.status(500).json({ error: true, message: error.message });
    }
};



const FilterTheHotelData = async (req, res) => {

    // filter parameter we get 
    const { location, roomType, checkIn, CheckOut, rooms, price } = req.query;

    // make the filter 
    const filter = {}

    if (location) {
        filter.hotelAddress = { $regex: location, $options: "i" }
    }
    if (checkIn && CheckOut) {
        filter.$and = [
            { checkInTime: { $gte: new Date(checkIn), $options: "i" } },
            { checkOutTime: { $lte: new Date(CheckOut), $options: "i" } }
        ]
    }




    // get the data by filter 
    try {
        const result = await HotelModel.find(filter);
        if (!result) return res.status(404).json({ message: "No date found" });

        res.status(200).json({ error: false, data: result })
    } catch (error) {
        res.status(500).json({ error })
    }
}





module.exports = { RegisterHotel, GetAllHotel, GetSingleHotel, UpdateHotelData, DeleteSingleHotel, DeleteAllHotelData, FilterTheHotelData, ReqHotelData };