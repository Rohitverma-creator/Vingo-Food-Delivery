import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const createEditShop = async (req, res) => {
  ``;
  try {
    const { name, city, state, address } = req.body;

    let shop = await Shop.findOne({ owner: req.userId });

    let image;

    if (req.file) {
      const uploadedUrl = await uploadOnCloudinary(req.file.path);
      if (!uploadedUrl) {
        return res.status(400).json({ message: "Image upload failed" });
      }
      image = uploadedUrl;
    } else if (shop) {
      image = shop.image;
    } else {
      return res.status(400).json({ message: "Image is required" });
    }

    if (!shop) {
      shop = await Shop.create({
        name,
        city,
        state,
        address,
        image,
        owner: req.userId,
      });
    } else {
      shop = await Shop.findByIdAndUpdate(
        shop._id,
        {
          name,
          city,
          state,
          address,
          image,
        },
        { new: true }
      );
    }

    await shop.populate("owner");
    return res.status(201).json(shop);
  } catch (error) {
    return res.status(500).json({
      message: `create shop error ${error.message}`,
    });
  }
};

export const getMyShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.userId })
      .populate("owner")
      .populate({
        path: "items",
        options: { sort: { updatedAt: -1 } },
      });

    if (!shop) {
      return res.status(200).json(null);
    }

    return res.status(200).json(shop);
  } catch (error) {
    return res.status(500).json({
      message: `get my shop error ${error.message}`,
    });
  }
};

export const getShopByCity = async (req, res) => {
  try {
    const { city } = req.params;
    const shops = await Shop.find({
      city: { $regex: new RegExp(`^${city}$`, "i") },
    }).populate("items");
    if (!shops) {
      return res.status(400).json({ message: "Shops not found" });
    }
    return res.status(200).json(shops);
  } catch (error) {
    return res.status(500).json({
      message: `get shop by city error ${error.message}`,
    });
  }
};
