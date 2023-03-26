const {Thought, User } = require("../models");

//Loads all the thoughts
const thoughtController ={
    getAllThoughts(req, res) {
        Thought.find({})
        .populate({
            path: "reactions",
            select: "=__v",
        })
        .select("=__v")
        .sort({_id: -1})
        .then((dbThoughtData) => res.json(dbThoughtData))
        .catch((err) => {
            console.log(err);
            res.sendStatus(400);
        });
    },

//Loads one thought by specific id
    getThoughtById({ params }, res) {
        Thought.findOne({ _id: params.id })
        .populate({
            path: "reactions",
            select: "-__v",
        })
        .select("-__v")
        .then((dbThoughtData) => {
            if (!dbThoughtData) {
            return res.status(404).json({ message: "No though with this id!" });
        }
        res.json(dbThoughtData);
    })
    .catch((err) => {
        console.log(err);
        res.sendStatus(400);
    });
},

//Creates thought and associates with the specific users thoughts
createThought({ params, body}, res) {
    Thought.create(body)
    .then(({_id}) => {
        return User.findOneAndUpdate(
            { _id: body.userId},
            {$push: {thoughts: _id } },
            { new: true }
            );
    })
    .then((dbUserData) => {
        if (!dbUserData) {
            return res
            .status(404)
            .json({ message: "Thought without a creator"});
        }
        res.json({ message: "Thought substantiated"});
    })
    .catch((err) => res.json(err));
},

//Update a thought
updateThought ({ params, body }, res) {
    Thought.findOneAndUpdate({ _id: params.id}, body, {
        new: true,
        runValidators: true,
    })
    .then((dbThoughtData) => {
        if (!dbThoughtData) {
            res.status(404).json({ message: "No thought with this id!" })
            return;
        }
        res.json(dbThoughtData);
    })
    .catch((err) => res.json(err));
},

//Delete a thought
deleteThought({ params }, res) {
    Thought.findOneAndDelete({ _id: params.id })
    .then((dbThoughtData) => {
        if (!dbThoughtData) {
            return res.status(404).json({ message: "No thought with this id!" });
        }
        return User.findOneAndUpdate(
            { thoughts: params.id },
            { $pull: { thoughts: params.id } },
            { new: true }
        );
    })
    .then((dbUserData) => {
        if (!dbUserData) {
            return res.status(404).json({ message: "No user with this id!" });
        }
        res.json({ message: "Thought deleted!" });
    })
    .catch((err) => res.json(err));
},

//Add a reaction to a thought
addReaction({ params, body }, res) {
    Thought.findOneAndUpdate(
        { _id: params.thoughtId },
        { $addToSet: { reactions: body } },
        { new: true, runValidators: true }
    )
    .then((dbThoughtData) => {
        if (!dbThoughtData) {
        res.status(404).json({ message: "No thought with this id!" });
        return;
        }
        res.json(dbThoughtData);
    })
    .catch((err) => res.json(err));
    },
    //Delete a reaction from a thought
    removeReaction({ params }, res) {
        Thought.findOneAndUpdate(
            { _id: params.thoughtId },
            { $pull: { reactions: { reactionId: params.reactionId } } },
            { new: true }
        )
        .then((dbThoughtData) => res.json(dbThoughtData))
        .catch((err) => res.json(err));
    },
};

module.exports = thoughtController;
