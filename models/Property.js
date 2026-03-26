import mongoose from 'mongoose';

const propertySchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    location: { type: String, required: true },
    address: { type: String, required: true },
    propertyType: { 
      type: String, 
      required: true,
      enum: ['Apartment', 'Villa', 'Plot', 'Commercial']
    },
    bedrooms: { type: Number, required: true },
    bathrooms: { type: Number, required: true },
    area: { type: Number, required: true },
    amenities: { type: [String], required: true },
    images: { type: [String], required: true }, // URLs from Cloudinary
    featured: { type: Boolean, default: false },
    status: { 
      type: String, 
      enum: ['Available', 'Sold'],
      default: 'Available'
    },
  },
  {
    timestamps: true,
  }
);

const Property = mongoose.model('Property', propertySchema);

export default Property;
