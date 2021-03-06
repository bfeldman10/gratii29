<?php
/**
* This class define a payload of a product for sale.
*
* @copyright 2013  Google Inc. All rights reserved.
* @author Rohit Panwar <panwar@google.com>
*/

class Payload {
  /**
  * @var string The target audience for JWT.
  */
  const AUDIENCE = "Google";

  /**
  * @var string The type of request.
  */
  const TYPE = "google/payments/inapp/subscription/v1";
  
  /**
  * @var integer The time when the purchase will expire (in seconds).
  */
  private $exp;

  /**
  * @var integer The time when JWT issued (in seconds).
  */
  private $iat;

  /**
  * @var array Requested  fields.
  */
  private $request = array();

  /**
  * @var string Name of product.
  */
  private $name;

  /**
  * @var string  Description of product.
  */
  private $description;

  /**
  * @var string Price in 2 decimal places.
  */
  private $price;

  /**
  * @var string Currency code.
  */
  private $currencyCode;

  /**
  * @var string Seller data.
  */
  private $sellerData;

  /**
  * @var array Payload.
  */
  public $payload = array();

  /**
  * Set JWT Issued time.
  * @param integer $issuedAt The time when the JWT was issued.
  */
  public function SetIssuedAt($issuedAt){
    $this->iat = $issuedAt;
  }

  /**
  * Set JWT expiration time.
  * @param integer $expiryTime The time when the purchase will expire.
  */
  public function SetExpiration($expiryTime) {
    $this->exp = $expiryTime;
  }

  /**
  * Add requested data into Request array.
  * @param string $fieldName Requested field name.
  * @param string $fieldValue Requested field value.
  */
  public function AddProperty($fieldName, $fieldValue) {
    $this->request[$fieldName] = $fieldValue;
  }
  
  /**
  * Create payload of the product.
  * @param string $sellerIdentifier Merchant Id.
  * @return array $this->payload Payload of the product.
  */
  public function CreatePayload($sellerIdentifier) {
    $this->payload['iss'] = $sellerIdentifier;    
    $this->payload['aud'] = self::AUDIENCE;    
    $this->payload['typ'] = self::TYPE;    
    $this->payload['exp'] = $this->exp;    
    $this->payload['iat'] = $this->iat;    
    $this->payload['request'] = $this->request;  
    return $this->payload;
  }
}