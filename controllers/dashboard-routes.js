const router = require('express').Router();
const sequelize = require('../config/connection');
const { Post, User, Comment, SharedSighting } = require('../models');
const withAuth = require('../middleware/auth');

router.get('/', withAuth, (req, res) => {
  Post.findAll({
    where: {
      user_id: req.session.user_id
    },
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
      res.render('dashboard', { posts, loggedIn: true });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.get('/edit/:id', withAuth, (req, res) => {
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

      res.render('edit-post', {
        post,
        loggedIn: true
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;