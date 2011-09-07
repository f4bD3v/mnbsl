<?

//echo $_POST['html'];die;
$html = $_POST['html'];
$action = $_POST['action'];
$splitter = '<!-- pagebreak -->';
$max_char = 2000;

$arr = array($splitter, '<p></p>', '<p>&nbsp;</p>');

$html = str_replace($arr, '', $html); // Убираем все pagebreaker и пустые параграфы из текста

if ($action == 'clear') {
	echo $html;
}
else {
	$max = (!empty($_POST['num'])) ? (int) $_POST['num'] : $max_char;

	$content = explode('<p', $html); // Делим по параграфам

	$html2 = '';
	$max2 = 0;
	
	/*	разбивка идет по параграфам, если сумма символов в параграфах больше $max - ствится $splitter	*/
	foreach ($content as $p) {
		$p = trim($p);
	    if (!empty($p)) {
			$cur = '';
			$cur = '<p' . $p;
			$len = strlen(strip_tags($cur));
			
			$max2 = $max2 + $len;
			$html2 .= $cur;
				
			if ($max2 >= $max) {
				$html2 .= $splitter;
				$max2 = 0;
			}
		}
	}
	echo $html2;
}
?>
