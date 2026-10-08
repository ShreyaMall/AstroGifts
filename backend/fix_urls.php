<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

$RUN = in_array('--run', $argv);   // bina --run ke sirf dikhayega, kuch nahi badlega

$pairs = [
    'http://127.0.0.1:8000'   => 'https://astrogiftsapi.website-design-india.com',
    'http:\/\/127.0.0.1:8000' => 'https:\/\/astrogiftsapi.website-design-india.com',
];

function fixVal($v, $pairs, &$changed) {
    if (is_string($v)) {
        $n = strtr($v, $pairs);
        if ($n !== $v) $changed = true;
        return $n;
    }
    
    if (is_array($v)) {
        foreach ($v as $k => $x) $v[$k] = fixVal($x, $pairs, $changed);
    }
    return $v;
}

// MongoDB connection Laravel config se lo
$connName = config('database.default');
if (config("database.connections.$connName.driver") !== 'mongodb') $connName = 'mongodb';
$conn = DB::connection($connName);
$db = method_exists($conn, 'getDatabase') ? $conn->getDatabase() : $conn->getMongoDB();

echo "Database: " . $db->getDatabaseName() . "\n";
echo $RUN ? "MODE: ASLI UPDATE\n\n" : "MODE: DRY RUN (kuch nahi badlega)\n\n";

$backup = [];
$total = 0;

foreach ($db->listCollections() as $info) {
    $name = $info->getName();
    if (str_starts_with($name, 'system.')) continue;

    $col = $db->selectCollection($name);
    $count = 0;

        foreach ($col->find([], ['typeMap' => ['root' => 'array', 'document' => 'array', 'array' => 'array']]) as $doc) {
        $set = [];
        foreach ($doc as $field => $val) {
            if ($field === '_id') continue;
            $changed = false;
            $new = fixVal($val, $pairs, $changed);
            if ($changed) {
                $set[$field] = $new;
                $backup[] = ['collection' => $name, '_id' => (string) $doc['_id'], 'field' => $field, 'old' => $val];
            }
        }
        if ($set) {
            $count++;
            if ($RUN) $col->updateOne(['_id' => $doc['_id']], ['$set' => $set]);
        }
    }

    if ($count) echo "$name: $count documents " . ($RUN ? "update ho gaye" : "update honge") . "\n";
    $total += $count;
}

if ($RUN && $backup) {
    $file = getenv('HOME') . '/mongo_url_backup_' . date('Y-m-d_His') . '.json';
    file_put_contents($file, json_encode($backup, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    echo "\nPurani values ka backup: $file\n";
}

echo "\nTOTAL: $total documents\n";
