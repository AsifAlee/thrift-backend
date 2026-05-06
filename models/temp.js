[
  {
    $match: {
      product: new ObjectId("68deb49b6f79cc0227d27325"),
    },
  },
  {
    $group: {
      _id: null,
      averageRating: {
        $avg: "$rating",
      },
      numberOfReviews: {
        $sum: 1,
      },
    },
  },
];
