/**
*  @swagger
*  definitions:
*    ValidationError:
*      type: object
*      properties:
*        message:
*          type: string
*          description: The message describing the error.
*          example: This variable is required
*        field:
*          type: string
*          description: The identifier of the field that the error pertains to.
*          example: name
*        validation:
*          type: string
*          description: The identifier of the validation rule that failed.
*          example: required
*/
