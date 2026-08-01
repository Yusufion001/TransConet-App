const fs = require('fs');
const content = fs.readFileSync('src/components/ExpressMatcher.tsx', 'utf-8');

const startMarker = '/* Match Result Dashboard with Built-In Negotiation Box */';
const endMarker = ') : (\n              <div className="mt-8 pt-6 border-t border-slate-200';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const newContent = content.substring(0, startIndex) +
    `/* Match Result Dashboard with Built-In Negotiation Box */
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-75">
          <BiddingInterface 
            activeMatch={activeMatch}
            negotiationStatus={negotiationStatus}
            isNegotiating={isNegotiating}
            setIsNegotiating={setIsNegotiating}
            counterPrice={counterPrice}
            setCounterPrice={setCounterPrice}
            handleAcceptBid={handleAcceptBid}
            handleCounterOffer={handleCounterOffer}
          />
          <TrackingView 
            acceptedJob={acceptedJob}
            setAcceptedJob={setAcceptedJob}
            detailsProvided={detailsProvided}
            setDetailsProvided={setDetailsProvided}
            mode={mode}
            activeMatch={activeMatch}
            pickupDetails={pickupDetails}
            setPickupDetails={setPickupDetails}
            deliveryDetails={deliveryDetails}
            setDeliveryDetails={setDeliveryDetails}
          />
        </div>
      ` + content.substring(endIndex);
  
  fs.writeFileSync('src/components/ExpressMatcher.tsx', newContent);
  console.log('Successfully patched ExpressMatcher.tsx');
} else {
  console.error('Could not find markers', startIndex, endIndex);
}
