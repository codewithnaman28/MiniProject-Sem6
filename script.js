// Load Brython script from CDN
var script = document.createElement('script');
// script.src = './brython.js';
document.head.appendChild(script);

// Brython onload callback
script.onload = function() {
    console.log("Brython script loaded");

    if (typeof window.brython === 'undefined') {
        console.error("Brython is not loaded");
        return;
    }

    // Initialize Brython
    window.brython({
        debug: 1,
        indexedDB: true
    }, function() {
        console.log("Brython initialized");
        runBrythonCode();
    });
};


function runBrythonCode() {
    // Embed Watermark Function
    function embedWatermark() {
        var imageFile = document.getElementById("imageInput").files[0];
        if (!imageFile) {
            alert("Please select an image first.");
            return;
        }

        var reader = new FileReader();
        
        reader.onload = function(event) {
            var imageArray = new Uint8Array(event.target.result);
            var imageBuffer = brython({'__name__': '__main__'}, 'array').array('B', imageArray);
            var watermark = brython({'__name__': '__main__'}, 'numpy').random.randint(0, 256, { size: 100, dtype: 'uint8' });

            try {
                var watermarkedImageData = brython.run(`import watermarking\n
                                                     image_data = bytes(imageBuffer)\n
                                                     watermark = bytes(watermark)\n
                                                     watermarked_image_data = watermarking.embed_watermark_to_image(image_data, watermark)\n
                                                     watermarked_image_data\n`, { imageBuffer, watermark });

                var blob = new Blob([new Uint8Array(watermarkedImageData)], { type: imageFile.type });
                var downloadUrl = URL.createObjectURL(blob);
                var downloadLink = document.createElement("a");
                downloadLink.href = downloadUrl;
                downloadLink.download = "watermarked_" + imageFile.name;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            } catch (error) {
                console.error("Error embedding watermark:", error);
            }
        };
        
        reader.readAsArrayBuffer(imageFile);
    }

    // Decode Watermark Function
    function decodeWatermark() {
        var imageFile = document.getElementById("imageInput").files[0];
        if (!imageFile) {
            alert("Please select an image first.");
            return;
        }

        var reader = new FileReader();
        
        reader.onload = function(event) {
            var imageArray = new Uint8Array(event.target.result);
            var imageBuffer = brython({'__name__': '__main__'}, 'array').array('B', imageArray);

            try {
                var decodedText = brython.run(`import watermarking\n
                                            image_data = bytes(imageBuffer)\n
                                            decoded_watermark, _ = watermarking.extract_watermark_from_image(image_data)\n
                                            decoded_watermark\n`, { imageBuffer });

                document.getElementById("decodedWatermark").textContent = decodedText;
            } catch (error) {
                console.error("Error decoding watermark:", error);
            }
        };
        
        reader.readAsArrayBuffer(imageFile);
    }

    // Event Listeners for Buttons
    document.getElementById("embedButton").addEventListener("click", embedWatermark);
    document.getElementById("decodeButton").addEventListener("click", decodeWatermark);
}
