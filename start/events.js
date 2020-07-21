const Event = use('Event')

Event.on('user::created', 'User.created')
Event.on('email::changed', 'User.emailChanged')
Event.on('password::changed', 'User.passwordChanged')
Event.on('forgot::password', 'User.forgotPassword')
