import type ShowPetByIdQueryResponse from 'showPetById.ts'

export function showPetById(data?: ShowPetByIdQueryResponse): Chainable<ShowPetByIdQueryResponse> {
  return cy.request('get', '/pets/:petId', data || undefined)
}
