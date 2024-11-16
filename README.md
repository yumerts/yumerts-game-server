# YumeRTS Game Server Backend

> Matchmaking + Game Server Combined Instance that will be put inside a TEE for remote attestation to correctly verify that the game logic is running as we expected it to run

Port 8080 is used for all types of games

## The workflow will work like this:

1. The user sends a create match transaction to the server (an event is logged)
2. Somebody joins that particular match (another event is logged) (the game is considered ready)
3. They connect to the game server websocket backend and submit the match id they are planning to join
4. Once the game server has confirmed both player has joined, the match countdown starts (30 seconds) for other people to predict on the match
5. Once 30 second has passed, the game server will mention that the match has been started
6. Once Game has ended