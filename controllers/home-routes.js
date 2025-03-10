const router = require('express').Router();
const sequelize = require('../config/connection');
const { Post, User, Comment, SharedSighting } = require('../models');

router.get('/', (req, res) => {
  console.log('======================');
  Post.findAll({
    order: [
      ['datetime', 'DESC'],
      ['sighting', 'ASC'],
    ],
    attributes: [
      'id',
      'sighting',
      'description',
      'datetime',
      'location',
      'created_at',
      [sequelize.literal('(SELECT COUNT(*) FROM sharedSighting WHERE post.id = sharedSighting.post_id)'), 'sharedSighting']
    ],
    include: [
      {
        model: Comment,
        attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
        include: {
          model: User,
          attributes: ['username']
        }
      },
      {
        model: User,
        attributes: ['username']
      }
    ]
  })
    .then(dbPostData => {
      const posts = dbPostData.map(post => post.get({ plain: true }));
      res.render('homepage', {
        posts,
        loggedIn: req.session.loggedIn
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.get('/post/:id', (req, res) => {
  Post.findOne({
    where: {
      id: req.params.id
    },
    attributes: [
      'id',
      'sighting',
      'description',
      'datetime',
      'location',
      'created_at',
      [sequelize.literal('(SELECT COUNT(*) FROM sharedSighting WHERE post.id = sharedSighting.post_id)'), 'sharedSighting']
    ],
    include: [
      {
        model: Comment,
        attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
        include: {
          model: User,
          attributes: ['username']
        }
      },
      {
        model: User,
        attributes: ['username']
      }
    ]
  })
    .then(dbPostData => {
      if (!dbPostData) {
        res.status(404).json({ message: 'No post found with this id' });
        return;
      }

      const post = dbPostData.get({ plain: true });

      res.render('single-post', {
        post,
        loggedIn: req.session.loggedIn
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.get('/login', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/');
    return;
  }

  res.render('login');
});

router.get('/signup', (req, res) => {
  res.render('signup');
});

module.exports = router;
