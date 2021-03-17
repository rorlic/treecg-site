import React, { useEffect, useState } from 'react'
import { availableViews } from '../util/Util'

export const SpecComponent = () => {
  return(
    <div className="specComponent">
      Coming soon.
      This is a link to the <a href={availableViews.spec.target}>spec</a>
    </div>
    )
}
