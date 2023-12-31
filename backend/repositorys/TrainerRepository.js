import User from "../models/userModel.js";
import Trainer from "../models/TrainerModel.js";
import Result from "../models/resultsModel.js";
import Videos from "../models/videosModel.js";
import Diet from "../models/dietModel.js";
import Live from "../models/lives.js";
class TrainerRepository {
  static instance;

  constructor() {
    if (TrainerRepository.instance) {
      return TrainerRepository.instance;
    }

    TrainerRepository.instance = this;
  }

  async findByEmail(email) {
    return await Trainer.findOne(email);
  }
  // async addLive(live) {
  //   return await Live.create(live);
  // }
  async matchPasswords(trainer, enteredPassword) {
    return await trainer.matchPasswords(enteredPassword);
  }

  async findById(trainerId) {
    return await Trainer.findById(trainerId);
  }

  async getPost(trainerId) {
    const post = await Result.findById(trainerId);
  }

  async updatePost(trainerId, newPost) {
    try {
      // Find the existing Result document by trainer ID
      let result = await Result.findOne({ trainer: trainerId });

      if (result) {
        // If the Result document exists, add the new post to the existing posts array
        result.posts.push(...newPost.posts);
      } else {
        // If the Result document doesn't exist, create a new one with the new post
        result = new Result(newPost);
      }

      // Save the updated or new Result document to the results collection
      await result.save();

      return result;
    } catch (error) {
      throw error;
    }
  }
  async updateDiet(trainerId, newDiet) {
    try {
      // Find the existing Diet document by trainer ID
      let result = await Diet.findOne({ trainer: trainerId });

      if (result) {
        // If the Diet document exists, add the new post to the existing posts array
        result.diets.push(...newDiet.diets);
      } else {
        // If the Diet document doesn't exist, create a new one with the new post
        result = new Diet(newDiet);
      }

      // Save the updated or new Diet document to the results collection
      await result.save();

      return result;
    } catch (error) {
      //throw error;
      console.log(error);
    }
  }

  async addLive(trainerId, live) {
    try {
      let result = await Live.findOne({ trainer: trainerId });

      if (result) {
        result.lives.push(...live.lives);
      } else {
        result = new Live(live);
      }

      await result.save();

      return result;
    } catch (error) {
      console.log(error);
    }
  }
  async getPosts(trainerId) {
    try {
      const result = await Result.findOne({ trainer: trainerId });

      if (result) {
        return result.posts.map((post) => {
          return {
            imageName: post.imageName,
            description: post.description,
            postId: post._id, 
          };
        });
      } else {
        return [];
      }
    } catch (error) {
      throw error;
    }
  }

  async getLives (trainerId)  {
    try {
      const lives = await Live.findOne({ trainer: trainerId });
      if (lives) {
        const currentDateTime = new Date();
        const expirationThreshold = 60 * 60 * 1000; // One hour in milliseconds
  
        lives.lives.forEach((live) => {
          // Convert the date from BSON Date to JavaScript Date
          const liveDateTime = new Date(live.date);
  
          // Set the time based on the live's time
          const [hours, minutes] = live.time.split(':');
          liveDateTime.setHours(Number(hours), Number(minutes), 0, 0);
  
          if (liveDateTime < currentDateTime) {
            const timeDifference = currentDateTime - liveDateTime;
  
            if (timeDifference < expirationThreshold) {
              // Set the status to "started" if less than one hour has passed
              live.expired = "started";
            
            } else {
              // Set the status to "expired" if more than or equal to one hour has passed
              live.expired = "true";
            }
          }
        });
        await lives.save();
        return lives.lives;
      } else {
        return [];
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
  
  
  
  async getDiets(trainerId) {
    try {
      // Find the Result document by trainer ID
      const result = await Diet.findOne({ trainer: trainerId });

      if (result) {
        // If the Result document exists, return the posts as an array of objects
        return result.diets.map((diet) => {
          return {
            imageName: diet.imageName,
            description: diet.description,
            dietId: diet._id,
            category: diet.category,
            dietType: diet.dietType,
            status: diet.status,
          };
        });
      } else {
        // If the Result document doesn't exist, return an empty array
        return [];
      }
    } catch (error) {
      console.log(error);
      throw error; // Handle any errors that occur during the database operation
    }
  }
  async updateVideo(trainerId, newVideo) {
    try {
      // Find the existing video document by trainer ID
      let videos = await Videos.findOne({ trainer: trainerId });

      if (videos) {
        videos.videos.push(...newVideo.videos);
      } else if (videos === null) {
        // If the video document doesn't exist, create a new one with the new video
        videos = new Videos(newVideo);
      }

      // Save the updated or new video document to the videos collection
      await videos.save();

      return videos; // Return the updated or newly created video document if needed
    } catch (error) {
      throw error; // Handle any errors that occur during the database operation
    }
  }

  async getVideos(trainerId) {
    try {
      // Find the videos document by trainer ID
      const videos = await Videos.findOne({ trainer: trainerId });

      if (videos) {
        // If the videos document exists, return the posts as an array of objects
        return videos.videos.map((post) => {
          return {
            videoName: post.videoName,
            specification: post.specification,
            description: post.description,
            postId: post._id,
            status: post.status,
          };
        });
      } else {
        // If the videos document doesn't exist, return an empty array
        return [];
      }
    } catch (error) {
      throw error; // Handle any errors that occur during the database operation
    }
  }

  async deletePost(postId, trainerId) {
    try {
      // Find the video document with the trainer ID and video ID inside the videos array
      const result = await Result.findOneAndUpdate(
        {
          trainer: trainerId,
          "posts._id": postId,
        },
        // Use $pull operator to remove the specific post from the posts array
        {
          $pull: {
            posts: {
              _id: postId,
            },
          },
        },
        // Add the option 'new: true' to return the modified document
        { new: true }
      );

      if (!result) {
        // Video not found
        return { success: false, message: "post not found." };
      }

      return { success: true, message: "post deleted successfully." };
    } catch (error) {
      // Handle error
      console.error(error);
      return { success: false, message: "Internal server error." };
    }
  }
  async deleteVideo(videoId, trainerId) {
    try {
      // Find the video document with the trainer ID and video ID inside the videos array
      const videos = await Videos.findOneAndUpdate(
        {
          trainer: trainerId,
          "videos._id": videoId,
        },
        // Use $pull operator to remove the specific post from the posts array
        {
          $pull: {
            videos: {
              _id: videoId,
            },
          },
        },
        { new: true }
      );

      if (!videos) {
        return { success: false, message: "video not found." };
      }

      return { success: true, message: "video deleted successfully." };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Internal server error." };
    }
  }

  async deleteDiet(dietId, trainerId) {
    try {
      const result = await Diet.findOneAndUpdate(
        {
          trainer: trainerId,
          "diets._id": dietId,
        },
        {
          $pull: {
            diets: {
              _id: dietId,
            },
          },
        },
        { new: true }
      );

      if (!result) {
        return { success: false, message: "diet not found." };
      }

      return { success: true, message: "diet deleted successfully." };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Internal server error." };
    }
  }

  async deleteLive(trainerId, liveId) {
    try {
      const result = await Live.findOneAndUpdate(
        {
          trainer: trainerId,
          "lives._id": liveId,
        },
        {
          $pull: {
            lives: {
              _id: liveId,
            },
          },
        },
        { new: true }
      );

      if (!result) {
        return { success: false, message: "live not found." };
      }

      return { success: true, message: "live deleted successfully." };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Internal server error." };
    }
  }

  async addProfileImage(imageName, trainerId) {
    try {
      const trainer = await Trainer.findById(trainerId);

      if (!trainer) {
        throw new Error("trainer not found");
      }
      const exists = trainer.imageName;

      trainer.imageName = imageName;

      await trainer.save();
      return exists;
    } catch (error) {
      throw new Error(`Error adding profile image: ${error.message}`);
    }
  }
  async editTrainer(trainerDetails) {
    const {
      trainerId,
      name,
      phone,
      qualifications,
      experience,
      specialties,
      description,
    } = trainerDetails;

    try {
      const updatedTrainer = await Trainer.findOneAndUpdate(
        { _id: trainerId },
        {
          $set: {
            name,
            phone,
            qualifications,
            experience,
            specialties,
            description,
          },
        },
        { new: true }
      );

      if (updatedTrainer) {
        return updatedTrainer;
      } else {
        throw new Error("Trainer not found");
      }
    } catch (error) {
      console.error(error.message);
      throw new Error(`Editing failed: ${error.message}`);
    }
  }

  async editDiet(trainer, dietId, category, dietType, description) {
    try {
      const result = await Diet.findOneAndUpdate(
        {
          trainer: trainer,
          "diets._id": dietId,
        },
        {
          $set: {
            "diets.$.category": category,
            "diets.$.dietType": dietType,
            "diets.$.description": description,
          },
        },
        { new: true }
      );

      if (!result) {
        return { success: false, message: "diet not found." };
      }

      return { success: true, message: "diet updated successfully." };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Internal server error." };
    }
  }
}

export default new TrainerRepository();
