import Logo from "../../../core/components/logo/Logo";
import Divider from "../../../core/components/ui/dividers/Divider";
import { usePlayer } from "../hooks/usePlayer";
import { useGame } from "../hooks/useGame";
import { UrlUtils } from "../utilities/UrlUtils";
import PlayerRenameForm from "./forms/PlayerRenameForm";
import GameJoinForm from "./forms/GameJoinForm";
import GameCreateForm from "./forms/GameCreateForm";
import Lobby from "./Lobby";

// Component -------------------------------------------------------------------
export default function Menu()
{
	const { player } = usePlayer();
	const { game } = useGame();

	return (
		<div className={ `tetris-menu` }>
			<header className={ `tetris-menu__header` }>
				<Logo />
			</header>
			<div className={ `tetris-menu__content` }>
				{ ( ! player.name )
					? <>
						<PlayerRenameForm initialValue={ UrlUtils.get('player') } />
					  </>
					: ( ! game.id )
						? <>
							<GameJoinForm initialValue={ UrlUtils.get('game') } />
							<Divider label='OR' />
							<GameCreateForm />
						</>
						: <>
							<Lobby />
						</>
				}
			</div>
		</div>
	);
}
