import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  answer: {
    type: String,
    required: true,
  },
  points: {
    type: Number,
    required: true,
  }
});

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  answers: {
    type: [answerSchema],
    required: true,
    validate: {
      validator: function(arr) {
        return arr.length >= 1 && arr.length <= 6;
      },
      message: 'Answers array must have at least 1 and no more than 6 items'
    }
  }
});

const Question = mongoose.model('Question', questionSchema);

export default Question;
