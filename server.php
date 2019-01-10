<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$a = file_get_contents("php://input");

$b = json_decode($a);

$dom = new DOMDocument('1.0');//Create new document with specified version number

$id_attribute = $dom->createAttribute('id');

$charset_attribute = $dom->createAttribute('charset');
$charset_attribute->value = 'UTF-8';

$html = $dom->createElement('html');
$head = $dom->createElement('head');
$meta = $dom->createElement('meta');
$style = $dom->createElement('style');
$body = $dom->createElement('body');

$dom->appendChild($html);
$html->appendChild($head);
$html->appendChild($body);
$head->appendChild($meta);
$meta->appendChild($charset_attribute);
$head->appendChild($style);

foreach ($b->text_elements as $text_element) {
    $Xtext = '';
    $div_style = '';
    $div_left = '';
    $div_top = '';
    $div_left_i = true;
    $div_top_i = true;
    $div_style_attribute = $dom->createAttribute('style');

    foreach ($text_element as $name => $value)   {
        if($name === 'Xposition'){
            $div_left = $value->x;
            $div_top = $value->y;

        }
        else if ($name == 'Xtext'){
            $Xtext = $value;
        }
        else{
            if($name === 'position'){
                $div_style = $div_style . $name . ':absolute;';
            }
            else if($name === 'left') {
                $div_left_i = false;
                $div_style = $div_style . $name . ':' . $div_left . 'px;';
            }
            else if($name === 'top'){
                $div_top_i = false;
                $div_style = $div_style . $name . ':' . $div_top . 'px;';
            }
            else {
                $div_style = $div_style . $name . ':' . $value . ';';
            }
        }
    }

    if($div_left_i){
        $div_style = $div_style .'left:' . $div_left . 'px;';
    }
    if($div_top_i){
        $div_style = $div_style . 'top:' . $div_top . 'px;';
    }
    $div = $dom->createElement('div',$Xtext);
    $div_style_attribute->value = $div_style;
    $div->appendChild($div_style_attribute);
    $body->appendChild($div);

}



  //Outputs the generated source code
//$css_text = 'p{color:#ff00ff;}';
//$style = $dom->createElement('style', $css_text);//Create new <style> tag with the css tags
//$domAttribute = $dom->createAttribute('type');//Create the new attribute 'type'
//$domAttribute->value = 'text/css';//Add value to attribute
//$style->appendChild($domAttribute);//Add the attribute to the style tag
//$dom->appendChild($style);//Add the style tag to document
echo $dom->saveHTML();
?>