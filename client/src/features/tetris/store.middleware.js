import { SocketService } from '../../core/services/SocketService';
import { TetrisActions } from './store.slice';
import { UrlUtils } from './utilities/UrlUtils';

// Middleware ------------------------------------------------------------------
export const TetrisMiddleware = (store) => (next) => (action) =>
{
	if ( ! store.getState().socket.isConnected )
	{
		return next(action);
	}

	const socket = SocketService;

	if ( TetrisActions.Enable.match(action) )
	{
		socket.on('tetris:room:joined', ({ id, mode, active, leader }) =>
		{
			store.dispatch(TetrisActions.ErrorsClear());
			store.dispatch(TetrisActions.GameUpdateInfos({ id, mode, active, leader: { name: leader } }));
			UrlUtils.set({ game: id });
		});

		socket.on('tetris:room:updated', ({ leader, players }) =>
		{
			if ( leader )
			{
				store.dispatch(TetrisActions.GameUpdateInfos({ leader: { name: leader } }));
			}

			if ( players )
			{
				store.dispatch(TetrisActions.GameUpdatePlayers({ players }));
			}
		});

		socket.on('tetris:room:leave', () =>
		{
			store.dispatch(TetrisActions.GameLeave());
			UrlUtils.set({ game: '' });
		});

		socket.on('tetris:game:started', () =>
		{
			store.dispatch(TetrisActions.GameStarted())
		});

		socket.on('tetris:game:updated', ({ score, piece, grid }) =>
		{
			if ( score )
			{
				store.dispatch(TetrisActions.GameUpdateScore(score));
			}

			if ( piece )
			{
				store.dispatch(TetrisActions.GameUpdatePiece(piece));
			}

			if ( grid )
			{
				store.dispatch(TetrisActions.GameUpdateGrid(grid));
			}
		});

		socket.on('tetris:game:ended', ({ name }) =>
		{
			store.dispatch(TetrisActions.GameEnded({ name }));
		});

		socket.on('tetris:game:winner', ({ name, score }) =>
		{
			store.dispatch(TetrisActions.GameWinner({ winner: { name, score } }));
		});

		return next(action);
	}

	if ( TetrisActions.Disable.match(action) )
	{
		socket.off('tetris:room:joined');
		socket.off('tetris:room:updated');
		socket.off('tetris:room:leave');
		socket.off('tetris:game:updated');
		socket.off('tetris:game:ended');

		return next(action);
	}

	if ( TetrisActions.PlayerRename.match(action) )
	{
		const { name } = action.payload;

		socket.emit('tetris:player:rename', { name }, (response) =>
		{
			const { name, error } = response;

			if ( error )
			{
				return store.dispatch(TetrisActions.PlayerRenameFailed({ error }));
			}

			action.payload.name = name;

			return next(action);
		});

		return ;
	}

	if ( TetrisActions.GameCreate.match(action) )
	{
		const { id, mode } = action.payload;

		socket.emit('tetris:room:create', { id, mode }, (response) =>
		{
			const { error } = response;

			if ( error )
			{
				return store.dispatch(TetrisActions.GameCreateFailed({ error }));
			}

			return next(action);
		});

		return ;
	}

	if ( TetrisActions.GameJoin.match(action) )
	{
		const { id } = action.payload;
		socket.emit('tetris:room:join', { id }, (response) =>
		{
			const { error } = response;

			if ( error )
			{
				return store.dispatch(TetrisActions.GameJoinFailed({ error }));
			}

			return next(action);
		});

		return ;
	}

	if ( TetrisActions.GameLeave.match(action) )
	{
		socket.emit('tetris:room:leave', (response) =>
		{
			const { error } = response;

			if ( error )
			{
				// Todo: Notification ?
 			}

			return next(action);
		});

		return ;
	}

	if ( TetrisActions.GameStart.match(action) )
	{
		socket.emit('tetris:game:start', (response) =>
		{
			const { error } = response;

			if ( error )
			{
				// Todo: Notification ?
 			}

			return next(action);
		});

		return ;
	}

	if ( TetrisActions.GameKick.match(action) )
	{
		const { name } = action.payload;

		socket.emit('tetris:room:kick', { name }, (response) =>
		{
			const { error } = response;

			if ( error )
			{
				// Todo: Notification ?
 			}

			return next(action);
		});

		return ;
	}

	if ( TetrisActions.GameAction.match(action) )
	{
		const { type } = action.payload;

		socket.emit('tetris:game:action', { action: type });

		return next(action);
	}

	return next(action);
};
