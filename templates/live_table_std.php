<script type="text/javascript">
Template.SetStyles("live_table_std", {
	details: {
		float: "left",
		width: 150,
		border: "1px solid red"
	},

	main: {
		float: "left"
	},

	util: {
		float: "left",
		width: 150
	}
});
</script>
<div class="template" id="live_table_std">
	<div data-class="root" data-id="root">
		<div data-class="details">
			asd
		</div>
		<div data-class="main">
			<div data-class="player">
				<div data-class="player_info" data-id="player_info_opponent">

				</div>
				<div data-class="player_clock" data-id="player_clock_opponent">

				</div>
			</div>
			<div data-class="board" data-id="board">

			</div>
			<div data-class="player">
				<div data-class="player_info" data-id="player_info_player">

				</div>
				<div data-class="player_clock" data-id="player_clock_player">

				</div>
			</div>
			<div data-class="table_chat">
				<div data-class="chat_box" data-id="table_chat_message_list">

				</div>
				<div data-class="chat_controls">
					<input type="text" data-class="table_chat_message" data-id="table_chat_message">
					<input type="button" data-class="table_chat_send" data-id="table_chat_send" value="Send">
				</div>
			</div>
		</div>
		<div data-class="util">
			<div data-class="history" data-id="history">

			</div>
			<div data-class="history_controls" data-id="history_controls">

			</div>
			<div data-class="buttons">
				<a class="button" href="javascript:void(0)" data-id="button_ready">Ready</a>
				<a class="button" href="javascript:void(0)" data-id="button_stand">Stand</a>
				<a class="button" href="javascript:void(0)" data-id="button_resign">Resign</a>
			</div>
			<div data-class="pieces_taken" data-id="pieces_taken">

			</div>
		</div>
	</div>
</div>